import { afterAll, beforeAll, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { chromium, type Browser, type ConsoleMessage } from "playwright";
import manifest from "../../package.json";
import { fixture_optionalPeerNames, fixture_scrollGuardBrowserSource } from "./fixtures";
import { runConsumerCommand } from "./helpers";

const consumerRoot = `${process.cwd()}/.tmp/scroll-guard-consumer/${Date.now()}`;
let browser: Browser;

beforeAll(async () => {
  await mkdir(consumerRoot, { recursive: true });
  await runConsumerCommand(["npm", "pack", "--ignore-scripts", "--pack-destination", consumerRoot], process.cwd());
  await Bun.write(
    `${consumerRoot}/package.json`,
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@alexgorbatchev/shadcn": `./alexgorbatchev-shadcn-${manifest.version}.tgz`,
        ...manifest.peerDependencies,
        ...Object.fromEntries(fixture_optionalPeerNames.map((peer) => [peer, undefined])),
      },
    }),
  );
  await runConsumerCommand([process.execPath, "install", "--ignore-scripts"], consumerRoot);
  await Bun.write(`${consumerRoot}/consumer.tsx`, fixture_scrollGuardBrowserSource);
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
  await rm(consumerRoot, { recursive: true, force: true });
});

test.each([
  [
    "development",
    [
      '[shadcn] Scrolling is forbidden by data-scroll="none": <div id="guarded"> (vertical: 300px > 100px). ' +
        "Move scrolling content into a nested ScrollArea or another explicit scroll viewport.",
    ],
  ],
  ["production", []],
])(
  "packed ScrollGuard respects the consuming application's %s mode",
  async (mode, expected) => {
    const build = await Bun.build({
      entrypoints: [`${consumerRoot}/consumer.tsx`],
      target: "browser",
      format: "iife",
      define: { "process.env.NODE_ENV": JSON.stringify(mode) },
      plugins: [
        {
          name: "enforce-consumer-isolation",
          setup(builder) {
            builder.onLoad({ filter: /./ }, (args) => {
              assert(args.path.startsWith(`${consumerRoot}/`), `Resolved outside packed consumer: ${args.path}`);
              return undefined;
            });
          },
        },
      ],
    });
    expect(build.success).toBe(true);
    expect(build.logs).toEqual([]);
    const output = build.outputs[0];
    assert(output);
    const page = await browser.newPage();
    const errors: string[] = [];
    const messages: ConsoleMessage[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => messages.push(message));
    try {
      await page.setContent('<div id="root"></div>');
      await page.evaluate(() => {
        document.body.dataset.observers = "0";
        const NativeResizeObserver = window.ResizeObserver;
        window.ResizeObserver = class extends NativeResizeObserver {
          constructor(callback: ResizeObserverCallback) {
            super(callback);
            document.body.dataset.observers = String(Number(document.body.dataset.observers) + 1);
          }
        };
      });
      await page.addScriptTag({ content: await output.text() });
      await page.waitForFunction(() => document.body.dataset.checked === "true");
      expect(errors).toEqual(expected);
      expect(
        messages.filter((message) => ["error", "warning"].includes(message.type())).map((message) => message.text()),
      ).toEqual([]);
      expect(await page.getByText("Overflowing content").isVisible()).toBe(true);
      expect(await page.evaluate(() => Number(document.body.dataset.observers) > 0)).toBe(mode === "development");
    } finally {
      await page.close();
    }
  },
  30_000,
);

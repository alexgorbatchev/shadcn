import { afterAll, beforeAll, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { chromium, type Browser } from "playwright";
import manifest from "../../package.json";
import { fixture_corePeers, fixture_optionalPeerNames } from "./fixtures";
import { runConsumerCommand } from "./helpers";

const consumerRoot = `${process.cwd()}/.tmp/analytics-consumer/${Date.now()}`;
let browser: Browser;

beforeAll(async () => {
  await mkdir(consumerRoot, { recursive: true });
  await Bun.write(`${consumerRoot}/tsconfig.json`, JSON.stringify({ compilerOptions: { jsx: "react-jsx" } }));
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
        ...fixture_corePeers,
      },
    }),
  );
  await runConsumerCommand([process.execPath, "install", "--ignore-scripts"], consumerRoot);
  await Bun.write(
    `${consumerRoot}/consumer.tsx`,
    `import { createRoot } from "react-dom/client";
import { Button } from "@alexgorbatchev/shadcn";
import { AnalyticsProvider, AnalyticsScope } from "@alexgorbatchev/shadcn/analytics";
createRoot(document.getElementById("root")!).render(
  <AnalyticsProvider transport={{track(event) { document.body.dataset.event = JSON.stringify(event); }}}>
    <AnalyticsScope name="installed"><Button analytics={{id:"packed"}}>Track</Button></AnalyticsScope>
  </AnalyticsProvider>
);`,
  );
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
  await rm(consumerRoot, { recursive: true, force: true });
});

test.each(["development", "production"])(
  "packed analytics shares context with core components in %s",
  async (mode) => {
    const build = await Bun.build({
      entrypoints: [`${consumerRoot}/consumer.tsx`],
      tsconfig: `${consumerRoot}/tsconfig.json`,
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
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.setContent('<div id="root"></div>');
      await page.addScriptTag({ content: await output.text() });
      await page.getByRole("button", { name: "Track" }).click();
      await page.waitForFunction(() => Boolean(document.body.dataset.event));
      expect(JSON.parse(await page.evaluate(() => document.body.dataset.event!))).toEqual({
        schemaVersion: 1,
        name: "ui.activate",
        component: "Button",
        id: "packed",
        scope: ["installed"],
        properties: {},
      });
      expect(errors).toEqual([]);
    } finally {
      await page.close();
    }
  },
  30_000,
);

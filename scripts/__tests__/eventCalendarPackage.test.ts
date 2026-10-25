import { afterAll, beforeAll, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { chromium, type Browser } from "playwright";
import manifest from "../../package.json";
import { fixture_corePeers, fixture_eventCalendarBrowserSource } from "./fixtures";
import { runConsumerCommand } from "./helpers";

const consumerRoot = `${process.cwd()}/.tmp/calendar-consumer/${Date.now()}`;
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
        react: manifest.peerDependencies.react,
        "react-dom": manifest.peerDependencies["react-dom"],
        "date-fns": manifest.peerDependencies["date-fns"],
        ...fixture_corePeers,
      },
    }),
  );
  // npm does not apply the library's Bun patches. Only the packed implementation can carry this fix.
  await runConsumerCommand(
    ["npm", "install", "--ignore-scripts", "--omit=optional", "--legacy-peer-deps"],
    consumerRoot,
  );
  await Bun.write(`${consumerRoot}/consumer.tsx`, fixture_eventCalendarBrowserSource);
  browser = await chromium.launch({ headless: true });
}, 60_000);
afterAll(async () => {
  await browser?.close();
  await rm(consumerRoot, { recursive: true, force: true });
});

test.each(["development", "production"])(
  "packed calendar preserves navigation without warnings in %s",
  async (mode) => {
    const build = await Bun.build({
      entrypoints: [`${consumerRoot}/consumer.tsx`],
      target: "browser",
      format: "iife",
      define: { "process.env.NODE_ENV": JSON.stringify(mode) },
      plugins: [
        {
          name: "isolated-calendar-consumer",
          setup(builder) {
            builder.onLoad({ filter: /./ }, (args) => {
              assert(args.path.startsWith(`${consumerRoot}/`), `Resolved outside consumer: ${args.path}`);
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
    const diagnostics: string[] = [];
    page.on("pageerror", (error) => diagnostics.push(error.message));
    page.on("console", (message) => {
      if (["warning", "error"].includes(message.type())) diagnostics.push(message.text());
    });
    try {
      await page.setContent('<div id="root"></div>');
      await page.addScriptTag({ content: await output.text() });
      const calendar = page.getByRole("region", { name: "Packed calendar" });
      await calendar.getByRole("button", { name: "Next" }).click();
      await page.getByRole("heading", { name: "November 2026" }).waitFor();
      await calendar.getByRole("button", { name: "Back" }).click();
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      await calendar.getByRole("button", { name: "Design review", exact: true }).click();
      await page.getByRole("status").filter({ hasText: "Design review" }).waitFor();
      await calendar.getByRole("button", { name: "Week", exact: true }).click();
      expect(await calendar.getByRole("button", { name: "Week", exact: true }).getAttribute("aria-pressed")).toBe(
        "true",
      );
      expect(diagnostics).toEqual([]);
    } finally {
      await page.close();
    }
  },
  30_000,
);

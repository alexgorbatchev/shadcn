import { afterAll, beforeAll, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { chromium, expect as browserExpect, type Browser, type ConsoleMessage } from "playwright/test";
import manifest from "../../package.json";
import { fixture_corePeers, fixture_treePackageSource } from "./fixtures";
import { runConsumerCommand } from "./helpers";

const consumerRoot = `${process.cwd()}/.tmp/tree-consumer/${Date.now()}`;
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
        ...fixture_corePeers,
      },
    }),
  );
  // npm cannot apply Bun's patches; the archive must contain the corrected native implementation.
  await runConsumerCommand(
    ["npm", "install", "--ignore-scripts", "--omit=optional", "--legacy-peer-deps"],
    consumerRoot,
  );
  await Bun.write(`${consumerRoot}/consumer.tsx`, fixture_treePackageSource);
  browser = await chromium.launch({ headless: true });
}, 60_000);
afterAll(async () => {
  await browser?.close();
  await rm(consumerRoot, { recursive: true, force: true });
});

test.each(["development", "production"])(
  "packed tree preserves native keyboard ownership without headless-tree peers in %s",
  async (mode) => {
    expect(await Bun.file(`${consumerRoot}/node_modules/@headless-tree/core/package.json`).exists()).toBe(false);
    expect(await Bun.file(`${consumerRoot}/node_modules/@headless-tree/react/package.json`).exists()).toBe(false);
    const build = await Bun.build({
      entrypoints: [`${consumerRoot}/consumer.tsx`],
      target: "browser",
      format: "iife",
      define: { "process.env.NODE_ENV": JSON.stringify(mode) },
      plugins: [
        {
          name: "isolated-tree-consumer",
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
    const consoleMessages: ConsoleMessage[] = [];
    page.on("pageerror", (error) => diagnostics.push(error.message));
    page.on("console", (message) => consoleMessages.push(message));
    try {
      await page.setContent('<div id="root"></div>');
      await page.addScriptTag({ content: await output.text() });
      const tree = page.getByRole("tree", { name: "Packed tree" });
      const source = tree.getByRole("treeitem", { name: "Source", exact: true });
      const destination = tree.getByRole("treeitem", { name: "Destination", exact: true });
      const action = tree.getByRole("button", { name: "Inspect Source" });
      const focused = page.getByRole("status", { name: "Focused item" });
      await source.click();
      await browserExpect(focused).toHaveText("Source");
      await action.focus();
      await action.press("ArrowDown");
      await browserExpect(action).toBeFocused();
      await browserExpect(focused).toHaveText("Source");
      await browserExpect(tree.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1);
      await browserExpect(source).toHaveAttribute("tabindex", "0");
      await action.press("Enter");
      await browserExpect(page.getByRole("status", { name: "Actions" })).toHaveText("1");
      await action.press("Space");
      await browserExpect(page.getByRole("status", { name: "Actions" })).toHaveText("2");
      await browserExpect(focused).toHaveText("Source");
      await source.focus();
      await source.press("Enter");
      await browserExpect(page.getByRole("status", { name: "Links" })).toHaveText("2");
      await browserExpect(page).toHaveURL("about:blank#Source");
      await source.press("ArrowDown");
      await browserExpect(destination).toBeFocused();
      await browserExpect(focused).toHaveText("Destination");
      await browserExpect(tree.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1);
      await browserExpect(destination).toHaveAttribute("tabindex", "0");
      expect(diagnostics).toEqual([]);
      expect(
        consoleMessages
          .filter((message) => ["warning", "error"].includes(message.type()))
          .map((message) => message.text()),
      ).toEqual([]);
    } finally {
      await page.close();
    }
  },
  30_000,
);

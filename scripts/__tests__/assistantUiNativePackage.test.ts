import { createTestDirectory } from "../createTestDirectory";
import { afterAll, beforeAll, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { chromium, type Browser } from "playwright";
import manifest from "../../package.json";
import { fixture_corePeers } from "./fixtures";
import { runConsumerCommand } from "./helpers";

// Every package the built native entry imports, besides React and the core peers.
const nativePeerNames = [
  "@assistant-ui/ai-sdk",
  "@assistant-ui/react",
  "@assistant-ui/react-markdown",
  "@assistant-ui/react-mcp",
  "@assistant-ui/store",
  "beautiful-mermaid",
  "cmdk",
  "react-resizable-panels",
  "react-shiki",
  "remark-gfm",
  "shiki",
  "zustand",
] as const;

const peerRanges: Record<string, string> = manifest.peerDependencies;
const consumerRoot = await createTestDirectory("assistant-ui-native-consumer");
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
        react: manifest.peerDependencies.react,
        "react-dom": manifest.peerDependencies["react-dom"],
        ...fixture_corePeers,
        ...Object.fromEntries(nativePeerNames.map((peer) => [peer, peerRanges[peer]])),
      },
    }),
  );
  // npm, unlike Bun, refuses peer-range conflicts, which is how consumers hit them.
  await runConsumerCommand(["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund"], consumerRoot);
  await Bun.write(
    `${consumerRoot}/consumer.tsx`,
    `import { createRoot } from "react-dom/client";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { Thread } from "@alexgorbatchev/shadcn/assistant-ui/native";
const adapter = { async run() { return { content: [{ type: "text", text: "Ready to help." }] }; } };
function App() {
  const runtime = useLocalRuntime(adapter);
  return <AssistantRuntimeProvider runtime={runtime}><Thread /></AssistantRuntimeProvider>;
}
createRoot(document.getElementById("root")!).render(<App />);`,
  );
  browser = await chromium.launch({ headless: true });
}, 240_000);

afterAll(async () => {
  await browser?.close();
  await rm(consumerRoot, { recursive: true, force: true });
}, 60_000);

test("an npm install of the packed native entry resolves one copy of the assistant-ui hook runtime", async () => {
  const copies = await Array.fromAsync(
    new Bun.Glob("**/node_modules/@assistant-ui/tap/package.json").scan({ cwd: consumerRoot }),
  );
  // Two copies give the store and the components separate hook state, which breaks every Thread re-render.
  expect(copies).toEqual(["node_modules/@assistant-ui/tap/package.json"]);
});

test.each(["development", "production"])(
  "packed native Thread renders and answers a message in %s",
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
    expect(build.logs).toEqual([]);
    expect(build.success).toBe(true);
    const output = build.outputs.find((artifact) => artifact.kind === "entry-point");
    assert(output);
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.setContent('<div id="root"></div>');
      await page.addScriptTag({ content: await output.text() });
      const input = page.getByRole("textbox", { name: "Message input" });
      await input.fill("Hello");
      await page.getByRole("button", { name: "Send Message" }).click();
      await page.getByText("Ready to help.", { exact: true }).waitFor();
      expect(errors).toEqual([]);
    } finally {
      await page.close();
    }
  },
  60_000,
);

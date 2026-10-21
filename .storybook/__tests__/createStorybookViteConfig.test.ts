import { expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { build, createLogger } from "vite";
import { createStorybookViteConfig } from "../createStorybookViteConfig.ts";
import { runConsumerCommand } from "../../scripts/__tests__/helpers.js";

test.each(["node", process.execPath])(
  "Storybook loads concurrent TypeScript configs without deprecations under %s",
  async (runtime) => {
    const root = `${process.cwd()}/.tmp/storybook-loader/${crypto.randomUUID()}`;
    await mkdir(root, { recursive: true });
    try {
      await Promise.all([
        Bun.write(`${root}/value.ts`, "export enum Scale { Two = 2 }; export const value: number = Scale.Two * 21;\n"),
        Bun.write(`${root}/main.ts`, 'import { value } from "./value.js"; export default value;\n'),
      ]);
      const source = `
      import { importModule } from "storybook/internal/common";
      const url = ${JSON.stringify(pathToFileURL(`${root}/main.ts`).href)};
      console.log(JSON.stringify(await Promise.all([importModule(url), importModule(url)])));
    `;
      const stdout = await runConsumerCommand(
        [runtime, "--throw-deprecation", "--input-type=module", "--eval", source],
        process.cwd(),
      );
      expect(stdout).toBe("[42,42]\n");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test("the React build handles client directives and forwards unrelated bundler warnings", async () => {
  const root = `${process.cwd()}/.tmp/storybook-directives/${crypto.randomUUID()}`;
  await mkdir(root, { recursive: true });
  try {
    await Promise.all([
      Bun.write(`${root}/client.ts`, '"use client"; export const client = 2;\n'),
      Bun.write(`${root}/other.ts`, '"use auditing"; export const other = 3;\n'),
      Bun.write(`${root}/main.ts`, 'export { client } from "./client.ts"; export { other } from "./other.ts";\n'),
    ]);
    const warnings: string[] = [];
    await build({
      configFile: false,
      ...createStorybookViteConfig(
        {
          root,
          customLogger: createLogger("silent"),
          build: {
            write: false,
            lib: { entry: `${root}/main.ts`, formats: ["es"] },
            rolldownOptions: {
              onwarn(warning) {
                warnings.push(warning.code ?? "UNKNOWN");
              },
            },
          },
        },
        { configType: "PRODUCTION", rootDirectory: root, allowedHosts: [] },
      ),
    });
    expect(warnings).toEqual(["MODULE_LEVEL_DIRECTIVE"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Node-loaded Storybook configuration builds package source aliases", async () => {
  const root = `${process.cwd()}/.tmp/storybook-alias/${crypto.randomUUID()}`;
  await mkdir(root, { recursive: true });
  try {
    await Bun.write(`${root}/main.ts`, 'import { cn } from "@/utils/cn"; export const value = cn("p-2", "p-3");\n');
    const source = `
      import { importModule } from "storybook/internal/common";
      import { build, createLogger } from "vite";
      const config = await importModule(${JSON.stringify(pathToFileURL(`${process.cwd()}/.storybook/main.ts`).href)});
      const result = await build(await config.viteFinal({
        configFile: false,
        customLogger: createLogger("silent"),
        build: { write: false, lib: { entry: ${JSON.stringify(`${root}/main.ts`)}, formats: ["es"] } },
      }, { configType: "PRODUCTION" }));
      const chunk = [result].flat().flatMap(build => build.output).find(item => item.type === "chunk" && item.isEntry);
      const module = await import("data:text/javascript;base64," + Buffer.from(chunk.code).toString("base64"));
      console.log(module.value);
    `;
    const stdout = await runConsumerCommand(
      ["node", "--throw-deprecation", "--input-type=module", "--eval", source],
      process.cwd(),
    );
    expect(stdout.trim().split("\n").at(-1)).toBe("p-3");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the production build rejects oversized transferred JavaScript", async () => {
  const root = `${process.cwd()}/.tmp/storybook-budget/${crypto.randomUUID()}`;
  await mkdir(root, { recursive: true });
  try {
    const payload = Array.from({ length: 12 }, () =>
      Buffer.from(crypto.getRandomValues(new Uint8Array(65_536))).toString("hex"),
    ).join("");
    await Bun.write(`${root}/main.ts`, `export const payload = ${JSON.stringify(payload)};\n`);
    await expect(
      build({
        configFile: false,
        ...createStorybookViteConfig(
          {
            root,
            customLogger: createLogger("silent"),
            build: { write: false, lib: { entry: `${root}/main.ts`, formats: ["es"] } },
          },
          { configType: "PRODUCTION", rootDirectory: root, allowedHosts: [] },
        ),
      }),
    ).rejects.toMatchObject({
      errors: [expect.objectContaining({ plugin: "storybook:bundle-budget", pluginCode: "STORYBOOK_BUNDLE_BUDGET" })],
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

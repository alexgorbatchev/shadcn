import { afterEach, expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { buildLlmDocs } from "../buildLlmDocs";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function createProject(): Promise<string> {
  const root = `${process.cwd()}/.tmp/llm-docs-tests/${crypto.randomUUID()}`;
  roots.push(root);
  await mkdir(root, { recursive: true });
  await Promise.all([
    Bun.write(
      `${root}/package.json`,
      JSON.stringify({
        name: "@test/ui",
        description: "Test controls.",
        exports: { ".": { import: "./dist/index.js" }, "./chart": { import: "./dist/components/chart/index.js" } },
      }),
    ),
    Bun.write(
      `${root}/tsconfig.json`,
      JSON.stringify({ compilerOptions: { moduleResolution: "bundler", module: "esnext", jsx: "react-jsx" } }),
    ),
    Bun.write(`${root}/README.md`, "# Setup\n\nUse the real theme.\n"),
    Bun.write(`${root}/src/index.ts`, 'export { Button as Action } from "./components/Button";'),
    Bun.write(`${root}/src/components/Button.tsx`, "export function Button() { return null; }"),
    Bun.write(`${root}/src/components/chart/index.ts`, 'export { Chart } from "./Chart";'),
    Bun.write(`${root}/src/components/chart/Chart.tsx`, "export function Chart() { return null; }"),
    Bun.write(
      `${root}/src/components/stories/actions/Button.stories.tsx`,
      `
import { Button as LocalButton } from "../../Button";
import { useState } from "react";
const meta = {
  title: "@test/ui/components/actions/Button",
  component: LocalButton,
  parameters: { docs: { description: { component: "It's a " + "control with {braces}." } } },
  args: { children: "Save", disabled: false },
  argTypes: { variant: { options: ["default", "outline"] } },
} satisfies Meta<typeof LocalButton>;
export default meta;
export const Default: Story = {};
export const Disabled: Story = { ...Default, args: { disabled: true } };
export const Nested: Story = {
  render: function Render(args) { const text = "} apostrophe's"; return <LocalButton {...args}>{text}</LocalButton>; },
  play: () => { throw new Error("never execute stories"); },
};
export const Inherited: Story = { ...Nested, args: { disabled: true }, globals: { theme: "dark" } };
`,
    ),
    Bun.write(
      `${root}/src/components/stories/charts/Button.stories.tsx`,
      `
import { Chart } from "../../chart/Chart";
export default { title: "@test/ui/components/charts/Button", component: Chart };
export const Default = { render: () => <Chart /> };
`,
    ),
  ]);
  return root;
}

test("generates linked docs with public aliases, optional entrypoints, metadata, and faithful CSF examples", async () => {
  const root = await createProject();
  await buildLlmDocs(root);
  expect(await Bun.file(`${root}/llms.txt`).text()).toBe(
    "# @test/ui\n\n> Test controls.\n\nGenerated from the public package exports and Storybook sources.\n\n## Guide\n\n- [Setup and usage](./llms/setup.md)\n\n## actions\n\n- [Button](./llms/components/actions/Button.md): It's a control with {braces}.\n\n## charts\n\n- [Button](./llms/components/charts/Button.md)\n",
  );
  expect(await Bun.file(`${root}/.tmp/llm-docs-public/llms.txt`).text()).toBe(
    await Bun.file(`${root}/llms.txt`).text(),
  );
  expect(await Bun.file(`${root}/llms/llms.txt`).exists()).toBe(false);
  expect(await Bun.file(`${root}/llms/setup.md`).text()).toBe("# Setup\n\nUse the real theme.\n");
  const doc = await Bun.file(`${root}/llms/components/actions/Button.md`).text();
  expect(doc).toMatchSnapshot();
  const chart = await Bun.file(`${root}/llms/components/charts/Button.md`).text();
  expect(chart).toMatchSnapshot();
});

test("regeneration removes stale pages and produces identical output", async () => {
  const root = await createProject();
  await buildLlmDocs(root);
  const first = await Bun.file(`${root}/llms.txt`).text();
  await Bun.write(`${root}/llms/components/stale.md`, "obsolete");
  await buildLlmDocs(root);
  expect(await Bun.file(`${root}/llms.txt`).text()).toBe(first);
  expect(await Bun.file(`${root}/llms/components/stale.md`).exists()).toBe(false);
});

test("invalid story metadata fails before replacing previously generated docs", async () => {
  const root = await createProject();
  await buildLlmDocs(root);
  const first = await Bun.file(`${root}/llms.txt`).text();
  await Bun.write(`${root}/src/components/stories/actions/Button.stories.tsx`, "export default { title: getTitle() };");
  await expect(buildLlmDocs(root)).rejects.toThrow(
    "Cannot resolve story title: src/components/stories/actions/Button.stories.tsx",
  );
  expect(await Bun.file(`${root}/llms.txt`).text()).toBe(first);
});

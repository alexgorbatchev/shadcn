import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { applyPatch } from "diff";
import { DiffViewer } from "../../../../assistant-ui/elements/DiffViewer.js";
import { NativeMarkdownFixture } from "../../native/helpers.js";
import { DensityProvider } from "../../../../DensityProvider.js";

const previous = "shared\nprevious line\n";
const next = "shared\nupdated line\nextra line\n";
const patch = [
  "diff --git a/before.ts b/after.ts",
  "--- a/before.ts",
  "+++ b/after.ts",
  "@@ -1,2 +1,3 @@",
  " shared",
  "-previous line",
  "+updated line",
  "+extra line",
  "",
].join("\n");
const meta: Meta<typeof DiffViewer> = {
  component: DiffViewer,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/DiffViewer",
  tags: ["autodocs", "test"],
  args: { oldFile: { name: "before.ts", content: previous }, newFile: { name: "after.ts", content: next } },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Unified: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("previous line").closest("del")).not.toBeNull();
    await expect(canvas.getByText("updated line").closest("ins")).not.toBeNull();
    await expect(canvas.getByLabelText("2 additions")).toBeVisible();
    await expect(canvas.getByLabelText("1 deletions")).toBeVisible();
  },
};
export const Split: Story = {
  ...Unified,
  args: { viewMode: "split" },
  play: async (context) => {
    await Unified.play?.(context);
    const canvas = within(context.canvasElement);
    await expect(canvas.getAllByText("shared")).toHaveLength(2);
    await expect(canvas.getByText("previous line").closest('[data-slot="diff-viewer-split-left"]')).not.toBeNull();
    await expect(canvas.getByText("updated line").closest('[data-slot="diff-viewer-split-right"]')).not.toBeNull();
  },
};
export const Patch: Story = { ...Unified, args: { patch }, play: Unified.play };
export const Collapsed: Story = {
  args: { maxCollapsedLines: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("extra line")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Show all 4 lines" }));
    await expect(canvas.getByText("extra line")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Show less" }));
    await expect(canvas.queryByText("extra line")).not.toBeInTheDocument();
  },
};
export const CopyPatch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copy diff of after.ts" }));
    await waitFor(async () => expect(applyPatch(previous, await navigator.clipboard.readText())).toBe(next));
  },
};
export const NoContent: Story = {
  args: { oldFile: undefined, newFile: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No diff content provided")).toBeVisible();
  },
};
export const MalformedPatch: Story = {
  ...NoContent,
  args: { ...NoContent.args, patch: "not a unified patch" },
  play: NoContent.play,
};
export const Plain: Story = {
  ...Unified,
  args: { showLineNumbers: false, showStats: false, copyable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("updated line")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText("2 additions")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="diff-viewer-line-number"]')).toBeNull();
  },
};
export const MarkdownIntegration: Story = {
  render: () => (
    <NativeMarkdownFixture text={`\`\`\`diff\n${patch}\`\`\``} components={{ SyntaxHighlighter: DiffViewer }} />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("updated line")).toBeVisible();
  },
};
export const CompactDark: Story = {
  ...Unified,
  globals: { theme: "dark", density: "compact" },
  args: { size: "sm", showIcon: true },
  play: Unified.play,
};
export const ComfortableLight: Story = {
  ...Unified,
  globals: { theme: "light", density: "comfortable" },
  args: { size: "lg", variant: "muted" },
  play: Unified.play,
};
export const Ghost: Story = { ...Unified, args: { variant: "ghost" }, play: Unified.play };
export const DensityComparison: Story = {
  render: (args) => (
    <>
      <DensityProvider density="compact">
        <DiffViewer {...args} role="region" aria-label="Compact diff" />
      </DensityProvider>
      <DensityProvider density="comfortable">
        <DiffViewer {...args} role="region" aria-label="Comfortable diff" />
      </DensityProvider>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const compact = within(canvas.getByRole("region", { name: "Compact diff" })).getByTestId("DiffViewerHeader");
    const comfortable = within(canvas.getByRole("region", { name: "Comfortable diff" })).getByTestId(
      "DiffViewerHeader",
    );
    await expect(comfortable.getBoundingClientRect().height).toBeGreaterThan(compact.getBoundingClientRect().height);
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DiffViewerFileContent } from "../../../../assistant-ui/elements/DiffViewerFileContent.js";
import { computeDiff } from "../../../../assistant-ui/utils/diffViewer/computeDiff.js";
import { pairLinesForSplit } from "../../../../assistant-ui/utils/diffViewer/pairLinesForSplit.js";

const file = { ...computeDiff("before\n", "after\n"), oldName: "before.ts", newName: "after.ts" };
const meta: Meta<typeof DiffViewerFileContent> = {
  component: DiffViewerFileContent,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/DiffViewerFileContent",
  tags: ["autodocs", "test"],
  args: {
    file,
    splitLinePairs: pairLinesForSplit(file.lines),
    viewMode: "unified",
    showLineNumbers: true,
    showIcon: true,
    showStats: true,
    copyable: false,
    maxCollapsedLines: 1,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Collapsed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("after")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Show all 2 lines" }));
    await expect(canvas.getByText("before").closest("del")).not.toBeNull();
    await expect(canvas.getByText("after").closest("ins")).not.toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Show less" }));
    await expect(canvas.queryByText("after")).not.toBeInTheDocument();
  },
};
export const Split: Story = {
  args: { viewMode: "split", maxCollapsedLines: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("before").closest('[data-slot="diff-viewer-split-left"]')).not.toBeNull();
    await expect(canvas.getByText("after").closest('[data-slot="diff-viewer-split-right"]')).not.toBeNull();
  },
};
export const ComfortableLight: Story = {
  ...Collapsed,
  globals: { theme: "light", density: "comfortable" },
  play: Collapsed.play,
};

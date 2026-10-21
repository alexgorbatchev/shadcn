import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerSplitLine } from "../../../../assistant-ui/elements/DiffViewerSplitLine.js";
const meta: Meta<typeof DiffViewerSplitLine> = {
  component: DiffViewerSplitLine,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/DiffViewerSplitLine",
  tags: ["autodocs", "test"],
  args: {
    pair: {
      left: { type: "del", content: "old call()", oldLineNumber: 4 },
      right: { type: "add", content: "new call()", newLineNumber: 5 },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("old call()").closest("del")).not.toBeNull();
    await expect(canvas.getByText("new call()").closest("ins")).not.toBeNull();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

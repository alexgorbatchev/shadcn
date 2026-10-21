import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerText } from "../../../../assistant-ui/elements/DiffViewerText.js";
const meta: Meta<typeof DiffViewerText> = {
  component: DiffViewerText,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/DiffViewerText",
  tags: ["autodocs", "test"],
  args: { line: { type: "del", content: "removed call()", oldLineNumber: 2 } },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("removed call()").closest("del")).not.toBeNull();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

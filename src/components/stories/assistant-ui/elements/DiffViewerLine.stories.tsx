import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerLine } from "../../../assistant-ui/elements/DiffViewerLine.js";
const meta: Meta<typeof DiffViewerLine> = {
  component: DiffViewerLine,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/DiffViewerLine",
  tags: ["autodocs", "test"],
  args: { line: { type: "add", content: "added call()", newLineNumber: 7 } },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("added call()").closest("ins")).not.toBeNull();
    await expect(canvas.getByText("7")).toBeVisible();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerStats } from "../../../../assistant-ui/elements/DiffViewerStats.js";
const meta: Meta<typeof DiffViewerStats> = {
  component: DiffViewerStats,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/DiffViewerStats",
  tags: ["autodocs", "test"],
  args: { additions: 3, deletions: 2 },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("3 additions")).toBeVisible();
    await expect(canvas.getByLabelText("2 deletions")).toBeVisible();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

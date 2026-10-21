import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerFileBadge } from "../../../../assistant-ui/elements/DiffViewerFileBadge.js";
const meta: Meta<typeof DiffViewerFileBadge> = {
  component: DiffViewerFileBadge,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/DiffViewerFileBadge",
  tags: ["autodocs", "test"],
  args: { filename: "review.tsx" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("TSX")).toBeVisible();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

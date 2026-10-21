import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerContent } from "../../../../assistant-ui/elements/DiffViewerContent.js";
const meta: Meta<typeof DiffViewerContent> = {
  component: DiffViewerContent,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/DiffViewerContent",
  tags: ["autodocs", "test"],
  args: { role: "region", "aria-label": "Diff contents", children: "line one\nline two" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Diff contents" })).toHaveTextContent("line one");
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

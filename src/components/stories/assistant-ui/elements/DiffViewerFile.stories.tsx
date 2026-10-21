import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerFile } from "../../../assistant-ui/elements/DiffViewerFile.js";
const meta: Meta<typeof DiffViewerFile> = {
  component: DiffViewerFile,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/DiffViewerFile",
  tags: ["autodocs", "test"],
  args: { role: "group", "aria-label": "Changed file", children: "review.ts" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Changed file" })).toHaveTextContent("review.ts");
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

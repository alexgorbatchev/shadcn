import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DiffViewerHeader } from "../../../assistant-ui/elements/DiffViewerHeader.js";
const meta: Meta<typeof DiffViewerHeader> = {
  component: DiffViewerHeader,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/DiffViewerHeader",
  tags: ["autodocs", "test"],
  args: {
    oldName: "before.ts",
    newName: "after.ts",
    additions: 1,
    deletions: 2,
    showIcon: true,
    copyText: "changed lines",
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("before.ts")).toBeVisible();
    await expect(canvas.getByText("after.ts")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Copy diff of after.ts" })).toBeEnabled();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};
export const OriginalNameOnly: Story = {
  render: () => <DiffViewerHeader oldName="removed.ts" deletions={4} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("removed.ts")).toBeVisible();
    await expect(canvas.getByText("−4")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const NewNameOnly: Story = {
  render: () => <DiffViewerHeader newName="new.ts" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("new.ts")).toBeVisible();
  },
};
export const NoFilename: Story = {
  render: () => <DiffViewerHeader />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId("DiffViewerHeader")).not.toBeInTheDocument();
  },
};

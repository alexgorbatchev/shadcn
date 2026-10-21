import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { FileTree } from "../../../../assistant-ui/elements/FileTree.js";

const meta: Meta<typeof FileTree> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/media-voice/FileTree",
  component: FileTree,
  tags: ["autodocs", "test"],
  args: {
    nodes: [
      { path: "src", name: "src", depth: 0, kind: "folder" },
      { path: "src/client.ts", name: "client.ts", depth: 1, kind: "file", additions: 12, deletions: 3 },
      { path: "src/server.ts", name: "server.ts", depth: 1, kind: "file", additions: 4 },
    ],
    visibleCount: 3,
    totalAdditions: 16,
    totalDeletions: 3,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Changes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("2 files changed")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("client.ts")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("+12")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("server.ts")).toBeVisible());
  },
};
export const Partial: Story = {
  args: { visibleCount: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("client.ts")).toBeVisible());
    await expect(canvas.queryByText("server.ts")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText("2 files changed")).toBeVisible());
  },
};
export const Empty: Story = {
  args: { nodes: [], visibleCount: 0, totalAdditions: 0, totalDeletions: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("0 files changed")).toBeVisible();
    await expect(within(canvasElement).queryByText("client.ts")).not.toBeInTheDocument();
  },
};

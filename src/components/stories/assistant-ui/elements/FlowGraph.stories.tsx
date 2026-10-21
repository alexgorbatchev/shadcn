import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { FlowGraph } from "../../../assistant-ui/elements/FlowGraph.js";
const meta: Meta<typeof FlowGraph> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/FlowGraph",
  component: FlowGraph,
  tags: ["autodocs", "test"],
  args: {
    nodes: [
      { id: "read", label: "Read", column: 0, row: 0, state: "done" },
      { id: "build", label: "Build", column: 1, row: 0, state: "active" },
      { id: "verify", label: "Verify", column: 2, row: 0, state: "pending" },
    ],
    edges: [
      { from: "read", to: "build" },
      { from: "build", to: "verify" },
    ],
    visibleCount: 3,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Workflow: Story = {
  play: async ({ canvasElement }) => {
    const nodes = within(within(canvasElement).getByRole("list", { name: "Workflow nodes" }));
    await waitFor(() => expect(nodes.getByRole("listitem", { name: "Read: done" })).toBeVisible());
    await waitFor(() => expect(nodes.getByRole("listitem", { name: "Build: active" })).toBeVisible());
    await waitFor(() => expect(nodes.getByRole("listitem", { name: "Verify: pending" })).toBeVisible());
  },
};
export const Partial: Story = {
  args: { visibleCount: 1 },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByRole("listitem", { name: "Read: done" })).toBeVisible());
    await expect(within(canvasElement).queryByText("Verify")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { nodes: [], edges: [], visibleCount: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("listitem")).not.toBeInTheDocument();
  },
};

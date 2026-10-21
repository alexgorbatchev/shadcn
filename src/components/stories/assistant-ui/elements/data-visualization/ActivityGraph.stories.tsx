import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { ActivityGraph } from "../../../../assistant-ui/elements/ActivityGraph.js";
const meta: Meta<typeof ActivityGraph> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/ActivityGraph",
  component: ActivityGraph,
  tags: ["autodocs", "test"],
  args: {
    title: "Agent activity",
    total: "6 tasks",
    start: "2026-10-01",
    end: "2026-10-20",
    data: [
      { date: "2026-10-12", count: 4 },
      { date: "2026-10-13", count: 2 },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Active: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Agent activity")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("6 tasks")).toBeVisible());
    await userEvent.hover(canvas.getByLabelText("4 contributions on Oct 12, 2026"));
    await expect(await canvas.findByRole("tooltip")).toHaveTextContent("4 contributions on Oct 12, 2026");
  },
};
export const Empty: Story = {
  args: { data: [], total: "0 tasks" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("0 tasks")).toBeVisible());
    await waitFor(() => expect(canvas.getByLabelText("0 contributions on Oct 12, 2026")).toBeVisible());
  },
};

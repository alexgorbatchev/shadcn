import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";

import { HeatGraph } from "../../../../assistant-ui/elements/HeatGraph.js";
const meta: Meta<typeof HeatGraph> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/HeatGraph",
  component: HeatGraph,
  tags: ["autodocs", "test"],
  args: {
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
export const Contributions: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("group", { name: "Contributions" })).toBeVisible());
    await userEvent.hover(canvas.getByLabelText("4 contributions on Oct 12, 2026"));
    await expect(await canvas.findByRole("tooltip")).toHaveTextContent("4 contributions on Oct 12, 2026");
    await userEvent.hover(canvas.getByText("Less"));
    await waitFor(() => expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument());
  },
};
export const Compact: Story = {
  args: { density: "compact", showMonths: false },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Less")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("More")).toBeVisible());
    await userEvent.hover(canvas.getByLabelText("2 contributions on Oct 13, 2026"));
    await expect(await canvas.findByRole("tooltip")).toHaveTextContent("2 contributions on Oct 13, 2026");
  },
};
export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByLabelText("0 contributions on Oct 12, 2026"));
    await expect(await canvas.findByRole("tooltip")).toHaveTextContent("0 contributions on Oct 12, 2026");
  },
};

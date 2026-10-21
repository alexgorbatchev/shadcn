import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { CostMeter } from "../../../../assistant-ui/elements/CostMeter.js";
const meta: Meta<typeof CostMeter> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/CostMeter",
  component: CostMeter,
  tags: ["autodocs", "test"],
  args: {
    runCost: "$0.04",
    sessionCost: "$0.12",
    lines: [
      { model: "Planner", inputTokens: 1500, outputTokens: 500, cost: "$0.03", share: 0.75 },
      { model: "Reviewer", inputTokens: 400, outputTokens: 100, cost: "$0.01", share: 0.25 },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Breakdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("$0.04")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("$0.12 session")).toBeVisible());
    await expect(canvas.getByRole("meter", { name: "Planner cost share" })).toHaveAttribute("value", "75");
    await expect(canvas.getByRole("meter", { name: "Reviewer cost share" })).toHaveAttribute("value", "25");
  },
};
export const Empty: Story = {
  args: { runCost: "$0.00", sessionCost: "$0.00", lines: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("$0.00")).toBeVisible());
    await expect(canvas.queryByRole("meter")).not.toBeInTheDocument();
  },
};

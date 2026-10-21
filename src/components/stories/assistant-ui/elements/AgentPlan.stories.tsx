import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AgentPlan } from "../../../assistant-ui/elements/AgentPlan.js";
const meta: Meta<typeof AgentPlan> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/AgentPlan",
  component: AgentPlan,
  tags: ["autodocs", "test"],
  args: {
    steps: [
      { id: "inspect", label: "Inspect", description: "Read the request" },
      { id: "implement", label: "Implement", description: "Apply the change" },
      "Verify",
    ],
    activeIndex: 1,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const InProgress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      Number(canvas.getByRole("progressbar", { name: "Plan progress" }).getAttribute("aria-valuenow")),
    ).toBeCloseTo(100 / 3);
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "1 of 3 steps");
    await expect(canvas.getByText("Apply the change")).toBeVisible();
    await expect(canvas.queryByText("Read the request")).not.toBeInTheDocument();
    await expect(canvas.getAllByRole("listitem")[0]).toHaveTextContent("Inspect done");
  },
};
export const Completed: Story = {
  args: { activeIndex: 100 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    for (const item of canvas.getAllByRole("listitem")) await expect(item).toHaveTextContent("done");
  },
};
export const Empty: Story = {
  args: { steps: [], activeIndex: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.queryByRole("listitem")).not.toBeInTheDocument();
  },
};

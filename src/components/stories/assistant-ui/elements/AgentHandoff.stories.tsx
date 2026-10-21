import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { AgentHandoff } from "../../../assistant-ui/elements/AgentHandoff.js";
const meta: Meta<typeof AgentHandoff> = {
  component: AgentHandoff,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/AgentHandoff",
  args: {
    from: "Planner",
    to: "Reviewer",
    reason: "Review the proposed changes",
    carried: ["Three packages inspected"],
    settled: false,
  },
  render: (args) => <AgentHandoff {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Transferring: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("Planner")).toBeVisible();
    await expect(canvas.getByText("Reviewer")).toBeVisible();
    await expect(canvas.getByText("Review the proposed changes")).toBeVisible();
    await expect(canvas.getByText("Three packages inspected")).toBeVisible();
  },
};
export const Settled: Story = { ...Transferring, args: { settled: true }, play: Transferring.play };
export const NoCarriedContext: Story = {
  args: { carried: [] },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("Review the proposed changes")).toBeVisible();
    await expect(canvas.queryByText("carried over")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Transferring, globals: { theme: "light" }, play: Transferring.play };
export const DarkTheme: Story = { ...Transferring, globals: { theme: "dark" }, play: Transferring.play };

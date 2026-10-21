import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { AgentStatus } from "../../../assistant-ui/elements/AgentStatus.js";
const meta: Meta<typeof AgentStatus> = {
  component: AgentStatus,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/AgentStatus",
  args: { state: "working", label: "Inspecting source", elapsed: "2.4s" },
  render: (args) => <AgentStatus {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Working: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("workingInspecting source2.4s");
  },
};
export const Waiting: Story = {
  args: { state: "waiting" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("waitingInspecting source2.4s");
  },
};
export const Done: Story = {
  args: { state: "done" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("doneInspecting source");
    await expect(canvas.queryByText("2.4s")).not.toBeInTheDocument();
  },
};
export const Failed: Story = {
  args: { state: "failed" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("failedInspecting source");
    await expect(canvas.queryByText("2.4s")).not.toBeInTheDocument();
  },
};
export const NoElapsedTime: Story = {
  args: { elapsed: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("workingInspecting source");
  },
};
export const LightTheme: Story = { ...Working, globals: { theme: "light" }, play: Working.play };
export const DarkTheme: Story = { ...Working, globals: { theme: "dark" }, play: Working.play };

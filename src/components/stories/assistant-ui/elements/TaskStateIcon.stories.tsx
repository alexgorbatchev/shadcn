import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { TaskStateIcon } from "../../../assistant-ui/elements/TaskStateIcon.js";
const meta: Meta<typeof TaskStateIcon> = {
  component: TaskStateIcon,
  render: (args) => <TaskStateIcon {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/TaskStateIcon",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { state: "working" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("TaskStateIcon")).toBeVisible());
  },
};
export const Waiting: Story = {
  ...Default,
  args: { ...Default.args, state: "waiting" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("TaskStateIcon")).toBeVisible();
  },
};
export const Done: Story = {
  ...Default,
  args: { ...Default.args, state: "done" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("TaskStateIcon")).toBeVisible();
  },
};
export const Failed: Story = {
  ...Default,
  args: { ...Default.args, state: "failed" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("TaskStateIcon")).toBeVisible();
  },
};
export const Cancelled: Story = {
  ...Default,
  args: { ...Default.args, state: "cancelled" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("TaskStateIcon")).toBeVisible();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

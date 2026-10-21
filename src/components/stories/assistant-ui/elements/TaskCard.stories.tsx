import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, userEvent } from "storybook/test";
import { TaskCard } from "../../../assistant-ui/elements/TaskCard.js";
const meta: Meta<typeof TaskCard> = {
  component: TaskCard,
  render: (args) => <TaskCard {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/TaskCard",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    label: "Inspect the workspace",
    state: "working",
    children: "Read package manifests",
    result: "3 packages found",
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("3 packages found")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /Inspect the workspace/ }));
    await waitFor(() => expect(canvas.getByText("Read package manifests")).toBeVisible());
    await expect(canvas.getByRole("button", { name: /Inspect the workspace/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};
export const Waiting: Story = {
  ...Default,
  args: { ...Default.args, state: "waiting" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("waiting", { exact: true })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Inspect the workspace/ }));
    await expect(canvas.getByRole("button", { name: /Inspect the workspace/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};
export const Done: Story = {
  ...Default,
  args: { ...Default.args, state: "done" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("done", { exact: true })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Inspect the workspace/ }));
    await expect(canvas.getByRole("button", { name: /Inspect the workspace/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};
export const Failed: Story = {
  ...Default,
  args: { ...Default.args, state: "failed" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("failed", { exact: true })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Inspect the workspace/ }));
    await expect(canvas.getByRole("button", { name: /Inspect the workspace/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};
export const Cancelled: Story = {
  ...Default,
  args: { ...Default.args, state: "cancelled" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("cancelled", { exact: true })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Inspect the workspace/ }));
    await expect(canvas.getByRole("button", { name: /Inspect the workspace/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, userEvent } from "storybook/test";
import { TodoList } from "../../../../assistant-ui/elements/TodoList.js";
const meta: Meta<typeof TodoList> = {
  component: TodoList,
  render: (args) => <TodoList {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/agents-tasks/TodoList",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    items: [
      { id: "one", text: "Read the source", status: "done" },
      { id: "two", text: "Review the result", status: "pending" },
    ],
    maxVisible: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Read the source")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Show 1 more" }));
    await waitFor(() => expect(canvas.getByText("Review the result")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Show less" }));
    await expect(canvas.queryByText("Review the result")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const ActiveAndFailedRemainVisible: Story = {
  args: {
    title: "Release tasks",
    description: "Review the outstanding work",
    revision: 2,
    maxVisible: 0,
    items: [
      { id: "active", text: "Build", status: "active", description: "Compile the package" },
      { id: "failed", text: "Publish", status: "failed", reason: "Authentication unavailable" },
      { id: "failed-without-reason", text: "Retry", status: "failed" },
      { id: "cancelled", text: "Old release", status: "cancelled", description: "Obsolete details" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Compile the package")).toBeVisible());
    await expect(canvas.getByText("Authentication unavailable")).toBeVisible();
    await expect(canvas.getByText("Retry")).toBeVisible();
    await expect(canvas.getByText("0/3 · rev 2")).toBeVisible();
    await expect(canvas.queryByText("Old release")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Show 1 more" }));
    await waitFor(() => expect(canvas.getByText("Old release")).toBeVisible());
    await expect(canvas.queryByText("Obsolete details")).not.toBeInTheDocument();
  },
};
export const AllVisible: Story = {
  args: { items: [{ id: "pending", text: "Review", status: "pending", description: "Read the results" }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Read the results")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

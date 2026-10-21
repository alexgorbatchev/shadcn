import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TaskTray } from "../../../../assistant-ui/native/TaskTray.js";
import { TaskTrayFixture } from "../fixtures/taskTray.js";

const meta: Meta<typeof TaskTray> = {
  component: TaskTray,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/agents-tasks/TaskTray",
  tags: ["autodocs", "test"],
  render: () => <TaskTrayFixture />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const PaginationAndReopen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", { name: "6 tasks done" });
    await userEvent.click(trigger);
    const list = await canvas.findByRole("list", { name: "Tasks" });
    await waitFor(() => expect(list).toBeVisible());
    await expect(within(list).queryByText("Inspect service 5")).not.toBeInTheDocument();
    await userEvent.click(within(list).getByRole("button", { name: "Show 2 more" }));
    await expect(within(list).getByText("Inspect service 6")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(list).not.toBeVisible());
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Show 2 more" })).toBeVisible());
  },
};
export const Waiting: Story = {
  render: () => <TaskTrayFixture state="waiting" count={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "1 task waiting for input" }));
    await waitFor(() => expect(canvas.getByRole("list", { name: "Tasks" })).toBeVisible());
    await expect(within(canvas.getByRole("list", { name: "Tasks" })).getByText("waiting")).toBeInTheDocument();
    await expect(canvas.getByText("explorer")).toBeVisible();
  },
};
export const Failed: Story = {
  render: () => <TaskTrayFixture state="failed" count={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "1 task done, 1 failed" }));
    await waitFor(() => expect(canvas.getByRole("list", { name: "Tasks" })).toBeVisible());
    await expect(within(canvas.getByRole("list", { name: "Tasks" })).getByText("failed")).toBeInTheDocument();
  },
};
export const MultipleRunning: Story = {
  render: () => <TaskTrayFixture state="running" count={2} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "2 of 2 tasks running" }));
    await waitFor(() => expect(canvas.getByRole("list", { name: "Tasks" })).toBeVisible());
    await expect(within(canvas.getByRole("list", { name: "Tasks" })).getAllByText("working")).toHaveLength(2);
  },
};
export const Empty: Story = {
  render: () => <TaskTrayFixture count={0} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};

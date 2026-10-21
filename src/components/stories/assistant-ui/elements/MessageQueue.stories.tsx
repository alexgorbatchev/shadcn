import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { MessageQueue } from "../../../assistant-ui/elements/MessageQueue.js";
const meta: Meta<typeof MessageQueue> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/MessageQueue",
  component: MessageQueue,
  tags: ["autodocs", "test"],
  args: {
    running: "Reviewing the layout",
    queued: [{ id: "keyboard", text: "Check the keyboard controls" }],
    onCancel: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Queued: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Reviewing the layout")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("1 queued")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: 'Remove "Check the keyboard controls" from the queue' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(args.onCancel).toHaveBeenCalledWith("keyboard");
  },
};
export const Empty: Story = {
  args: { queued: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("list")).toBeEmptyDOMElement();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText("Reviewing the layout")).toBeVisible());
  },
};
export const ReadOnly: Story = {
  args: { onCancel: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Check the keyboard controls")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

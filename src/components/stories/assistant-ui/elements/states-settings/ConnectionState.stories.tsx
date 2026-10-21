import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ConnectionState } from "../../../../assistant-ui/elements/ConnectionState.js";
const meta: Meta<typeof ConnectionState> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/ConnectionState",
  component: ConnectionState,
  tags: ["autodocs", "test"],
  args: { phase: "dropped", onRetry: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Dropped: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Connection lost. The run kept going on the server.");
    await userEvent.click(canvas.getByRole("button", { name: "Reconnect" }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const Reconnecting: Story = {
  args: { phase: "reconnecting", attempt: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Reconnectingattempt 3");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Resumed: Story = {
  args: { phase: "resumed", resumedTokens: 128 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Picked the stream back up.+128 tokens");
  },
};
export const Online: Story = {
  args: { phase: "online" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("status")).not.toBeInTheDocument();
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { LauncherBubble } from "../../../assistant-ui/elements/LauncherBubble.js";
const meta: Meta<typeof LauncherBubble> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/LauncherBubble",
  component: LauncherBubble,
  tags: ["autodocs", "test"],
  args: {
    open: false,
    unread: 3,
    greeting: "How can I help?",
    prompts: ["Inspect the service", "Explain an error"],
    replyExpectation: "Replies when the agent is available",
    onToggle: fn(),
    onPick: fn(),
    onStart: fn(),
  },
  render: function Interactive(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <LauncherBubble
        {...args}
        open={open}
        onToggle={() => {
          args.onToggle?.();
          setOpen(!open);
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const OpenAndPick: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Open the assistant" });
    await expect(toggle).toHaveAccessibleDescription("3 unread");
    await userEvent.click(toggle);
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("region", { name: "Assistant welcome" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Inspect the service" }));
    await expect(args.onPick).toHaveBeenCalledWith("Inspect the service");
    await userEvent.click(canvas.getByRole("button", { name: "Start a conversation" }));
    await expect(args.onStart).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Close the assistant" }));
    await expect(canvas.queryByRole("region")).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  args: { open: true, onToggle: undefined, onPick: undefined, onStart: undefined },
  render: (args) => <LauncherBubble {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("Inspect the service")).toBeVisible();
  },
};
export const Unavailable: Story = {
  args: { onToggle: undefined },
  render: (args) => <LauncherBubble {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Open the assistant" })).toBeDisabled();
  },
};

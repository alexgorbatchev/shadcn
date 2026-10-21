import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerSend } from "../../../assistant-ui/elements/ComposerSend.js";
const meta: Meta<typeof ComposerSend> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerSend",
  component: ComposerSend,
  tags: ["autodocs", "test"],
  args: { streaming: false, idle: false, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Ready: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Send message" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Idle: Story = {
  args: { idle: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Send message" });
    await expect(button).toBeDisabled();
    button.focus();
    await expect(button).not.toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const Streaming: Story = {
  args: { streaming: true, idle: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Stop generating" });
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Disabled: Story = {
  args: { disabled: true, streaming: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Stop generating" });
    await expect(button).toBeDisabled();
    button.focus();
    await expect(button).not.toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

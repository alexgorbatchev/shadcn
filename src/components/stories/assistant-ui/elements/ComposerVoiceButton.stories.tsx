import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerVoiceButton } from "../../../assistant-ui/elements/ComposerVoiceButton.js";
const meta: Meta<typeof ComposerVoiceButton> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerVoiceButton",
  component: ComposerVoiceButton,
  tags: ["autodocs", "test"],
  args: { active: false, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Start: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Start voice input" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Stop: Story = {
  args: { active: true },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Stop recording" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Start voice input" });
    await expect(button).toBeDisabled();
    button.focus();
    await expect(button).not.toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

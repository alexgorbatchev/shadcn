import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerAttachButton } from "../../../assistant-ui/elements/ComposerAttachButton.js";
const meta: Meta<typeof ComposerAttachButton> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerAttachButton",
  component: ComposerAttachButton,
  tags: ["autodocs", "test"],
  args: { onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Add attachment" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Unavailable: Story = {
  args: { onClick: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Add attachment" })).toBeDisabled();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Add attachment" });
    await expect(button).toBeDisabled();
    button.focus();
    await expect(button).not.toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

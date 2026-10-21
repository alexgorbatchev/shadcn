import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerMenuItem } from "../../../assistant-ui/elements/ComposerMenuItem.js";
const meta: Meta<typeof ComposerMenuItem> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerMenuItem",
  component: ComposerMenuItem,
  tags: ["autodocs", "test"],
  args: { children: "Review the change", active: false, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Review the change" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(button).not.toHaveAttribute("aria-current");
  },
};
export const Active: Story = {
  args: { active: true, shortcut: "Enter" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Review the change" });
    await expect(button).toHaveAttribute("aria-current", "true");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Review the change" });
    await expect(button).toBeDisabled();
    button.focus();
    await expect(button).not.toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

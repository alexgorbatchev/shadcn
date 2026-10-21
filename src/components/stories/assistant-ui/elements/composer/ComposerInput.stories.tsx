import type { Meta, StoryObj } from "@storybook/react-vite";
import type { KeyboardEvent } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerInput } from "../../../../assistant-ui/elements/ComposerInput.js";
const meta: Meta<typeof ComposerInput> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/ComposerInput",
  component: ComposerInput,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Message", onSubmit: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Submit: Story = {
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "Review the layout");
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("Review the layout");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const Prevented: Story = {
  args: { onKeyDown: fn((event: KeyboardEvent<HTMLInputElement>) => event.preventDefault()) },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("textbox", { name: "Message" }));
    await userEvent.keyboard("{Enter}");
    await expect(args.onKeyDown).toHaveBeenCalledTimes(1);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Saved message" },
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Message" });
    await expect(input).toBeDisabled();
    await userEvent.type(input, "Change");
    await expect(input).toHaveValue("Saved message");
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

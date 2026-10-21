import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerModelTrigger } from "../../../assistant-ui/elements/ComposerModelTrigger.js";
const meta: Meta<typeof ComposerModelTrigger> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerModelTrigger",
  component: ComposerModelTrigger,
  tags: ["autodocs", "test"],
  args: { model: "Local reviewer", open: false, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Closed: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Local reviewer" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Open: Story = {
  args: { open: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Local reviewer" });
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

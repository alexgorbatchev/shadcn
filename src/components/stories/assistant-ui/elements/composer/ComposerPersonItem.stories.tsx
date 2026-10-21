import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerPersonItem } from "../../../../assistant-ui/elements/ComposerPersonItem.js";
import { fixture_composerPerson } from "../fixtures.js";
const meta: Meta<typeof ComposerPersonItem> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/ComposerPersonItem",
  component: ComposerPersonItem,
  tags: ["autodocs", "test"],
  args: { person: fixture_composerPerson, active: false, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Agent: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Reviewer agent" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Human: Story = {
  args: { person: { name: "Alex", role: "human" }, active: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Alex human" });
    await expect(button).toHaveAttribute("aria-current", "true");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

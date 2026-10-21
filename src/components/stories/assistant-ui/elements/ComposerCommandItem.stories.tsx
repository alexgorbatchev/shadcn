import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerCommandItem } from "../../../assistant-ui/elements/ComposerCommandItem.js";
import { fixture_composerCommand } from "./fixtures.js";
const meta: Meta<typeof ComposerCommandItem> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerCommandItem",
  component: ComposerCommandItem,
  tags: ["autodocs", "test"],
  args: { command: fixture_composerCommand, active: false, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "/review Review a change" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Active: Story = {
  args: { active: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "/review Review a change" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(canvas.getByText("Enter")).toBeVisible();
  },
};

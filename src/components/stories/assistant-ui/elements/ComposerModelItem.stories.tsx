import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerModelItem } from "../../../assistant-ui/elements/ComposerModelItem.js";
const meta: Meta<typeof ComposerModelItem> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerModelItem",
  component: ComposerModelItem,
  tags: ["autodocs", "test"],
  args: { entry: { name: "Local reviewer", meta: "Fast" }, selected: false, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Local reviewer Fast" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Local reviewer Fast" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { DraftRestore } from "../../../assistant-ui/elements/DraftRestore.js";
const meta: Meta<typeof DraftRestore> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/DraftRestore",
  component: DraftRestore,
  tags: ["autodocs", "test"],
  args: { draft: "Review the keyboard interaction", savedAt: "09:30", onRestore: fn(), onDiscard: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Restore: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Review the keyboard interaction")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("unsent draft · 09:30")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Restore" }));
    await expect(args.onRestore).toHaveBeenCalledTimes(1);
    await expect(args.onDiscard).not.toHaveBeenCalled();
  },
};
export const Discard: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Discard the draft" }));
    await expect(args.onDiscard).toHaveBeenCalledTimes(1);
    await expect(args.onRestore).not.toHaveBeenCalled();
  },
};
export const ReadOnly: Story = {
  args: { onRestore: undefined, onDiscard: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Restore" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Discard the draft" })).toBeDisabled();
  },
};

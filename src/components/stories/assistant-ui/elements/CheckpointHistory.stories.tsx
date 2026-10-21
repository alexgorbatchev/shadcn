import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CheckpointHistory } from "../../../assistant-ui/elements/CheckpointHistory.js";
const meta: Meta<typeof CheckpointHistory> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/CheckpointHistory",
  component: CheckpointHistory,
  tags: ["autodocs", "test"],
  args: {
    checkpoints: [
      { id: "initial", label: "Before edit", at: "10:00", files: 2 },
      { id: "edited", label: "After edit", at: "10:05", files: 3 },
    ],
    currentId: "edited",
    onRestore: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Restore: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Restore to After edit" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Restore to Before edit" }));
    await expect(args.onRestore).toHaveBeenCalledWith("initial");
    await expect(canvas.getByText("current")).toBeVisible();
  },
};
export const ReadOnly: Story = {
  args: { onRestore: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("Before edit")).toBeVisible();
  },
};
export const Empty: Story = {
  args: { checkpoints: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Checkpoints")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

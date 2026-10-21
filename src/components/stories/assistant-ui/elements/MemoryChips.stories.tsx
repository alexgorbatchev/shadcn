import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { MemoryChips } from "../../../assistant-ui/elements/MemoryChips.js";
const meta: Meta<typeof MemoryChips> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/MemoryChips",
  component: MemoryChips,
  tags: ["autodocs", "test"],
  args: {
    chips: [
      { id: "language", text: "Prefers TypeScript", change: "added" },
      { id: "theme", text: "Uses the dark theme", change: "updated" },
      { id: "editor", text: "Uses Neovim", change: "existing" },
    ],
    onForget: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Changes: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("remembered 2")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: 'Forget "Prefers TypeScript"' }));
    await expect(args.onForget).toHaveBeenCalledTimes(1);
    await expect(args.onForget).toHaveBeenCalledWith("language");
    await waitFor(() => expect(canvas.getByText("Uses Neovim")).toBeVisible());
  },
};
export const Existing: Story = {
  args: { chips: [{ id: "editor", text: "Uses Neovim", change: "existing" }], onForget: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("memory")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { chips: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("memory")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

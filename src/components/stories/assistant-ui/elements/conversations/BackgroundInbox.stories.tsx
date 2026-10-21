import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BackgroundInbox } from "../../../../assistant-ui/elements/BackgroundInbox.js";

const meta: Meta<typeof BackgroundInbox> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/BackgroundInbox",
  component: BackgroundInbox,
  tags: ["autodocs", "test"],
  args: {
    runs: [
      { id: "ready", title: "Review", state: "ready", elapsed: "12s", summary: "Three findings" },
      { id: "running", title: "Build", state: "running", elapsed: "5s" },
      { id: "failed", title: "Deploy", state: "failed", elapsed: "2s", summary: "Connection refused" },
    ],
    onCollect: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Collect: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("1 ready")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Build 5s" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Review Three findings 12s" }));
    await expect(args.onCollect).toHaveBeenCalledWith("ready");
    await userEvent.click(canvas.getByRole("button", { name: "Deploy Connection refused 2s" }));
    await expect(args.onCollect).toHaveBeenLastCalledWith("failed");
  },
};
export const ReadOnly: Story = {
  args: { onCollect: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Three findings")).toBeVisible();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { runs: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("0 in flight")).toBeVisible();
  },
};

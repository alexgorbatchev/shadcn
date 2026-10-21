import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { MessagePair } from "../../../../assistant-ui/elements/MessagePair.js";
const meta: Meta<typeof MessagePair> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/MessagePair",
  component: MessagePair,
  tags: ["autodocs", "test"],
  args: {
    userMessage: "Explain the change",
    words: ["First", "second", "final"],
    visibleWords: 3,
    streaming: false,
    onCopy: fn(),
    onRegenerate: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Actions: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copy response" }));
    await expect(args.onCopy).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Regenerate response" }));
    await expect(args.onRegenerate).toHaveBeenCalledTimes(1);
  },
};
export const Streaming: Story = {
  args: { visibleWords: 2, streaming: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("second")).toBeVisible());
    await expect(canvas.queryByText("final")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { visibleWords: -1, onCopy: undefined, onRegenerate: undefined, variant: "flat" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("First")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("Explain the change")).toBeVisible();
  },
};

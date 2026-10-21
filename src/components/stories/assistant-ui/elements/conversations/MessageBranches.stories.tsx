import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { MessageBranches } from "../../../../assistant-ui/elements/MessageBranches.js";
const meta: Meta<typeof MessageBranches> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/MessageBranches",
  component: MessageBranches,
  tags: ["autodocs", "test"],
  args: { variants: ["First response", "Second response"], index: 0, onIndexChange: fn() },
  render: function Interactive(args) {
    const [index, setIndex] = useState(args.index);
    return (
      <MessageBranches
        {...args}
        index={index}
        onIndexChange={(nextIndex) => {
          args.onIndexChange(nextIndex);
          setIndex(nextIndex);
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Navigation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show previous response" }));
    await waitFor(() => expect(canvas.getByText("Second response")).toBeVisible());
    await expect(args.onIndexChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(canvas.getByRole("button", { name: "Show next response" }));
    await waitFor(() => expect(canvas.getByText("First response")).toBeVisible());
    await expect(args.onIndexChange).toHaveBeenLastCalledWith(0);
  },
};
export const Single: Story = {
  args: { variants: ["Only response"] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Show previous response" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Show next response" })).toBeDisabled();
    await waitFor(() => expect(canvas.getByText("1 / 1")).toBeVisible());
  },
};
export const Empty: Story = {
  args: { variants: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("0 / 0")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Show next response" })).toBeDisabled();
  },
};
export const OutOfRange: Story = {
  args: { index: 99 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("2 / 2")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Second response")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Show next response" }));
    await expect(args.onIndexChange).toHaveBeenLastCalledWith(0);
  },
};

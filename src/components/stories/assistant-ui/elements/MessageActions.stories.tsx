import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MessageActions, type Reaction } from "../../../assistant-ui/elements/MessageActions.js";
const meta: Meta<typeof MessageActions> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/MessageActions",
  component: MessageActions,
  tags: ["autodocs", "test"],
  args: {
    copied: false,
    reaction: null,
    regenerating: false,
    onCopy: fn(),
    onReactionChange: fn(),
    onRegenerate: fn(),
    onMore: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Actions: Story = {
  render: function Render(args) {
    const [reaction, setReaction] = useState<Reaction>(args.reaction);
    const [copied, setCopied] = useState(args.copied);
    return (
      <MessageActions
        {...args}
        reaction={reaction}
        copied={copied}
        onCopy={() => {
          args.onCopy();
          setCopied(true);
        }}
        onReactionChange={(next) => {
          args.onReactionChange(next);
          setReaction(next);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copy response" }));
    await expect(args.onCopy).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: "Copied response" })).toBeVisible();
    const helpful = canvas.getByRole("button", { name: "Mark response helpful" });
    const unhelpful = canvas.getByRole("button", { name: "Mark response unhelpful" });
    await userEvent.click(helpful);
    await expect(helpful).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(unhelpful);
    await expect(helpful).toHaveAttribute("aria-pressed", "false");
    await expect(unhelpful).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(unhelpful);
    await expect(args.onReactionChange).toHaveBeenLastCalledWith(null);
    await userEvent.click(canvas.getByRole("button", { name: "Regenerate response" }));
    await expect(args.onRegenerate).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "More response actions" }));
    await expect(args.onMore).toHaveBeenCalledTimes(1);
  },
};
export const Regenerating: Story = {
  args: { copied: true, reaction: "up", regenerating: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Copied response" })).toBeVisible();
    await expect(within(canvasElement).getByRole("button", { name: "Mark response helpful" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};

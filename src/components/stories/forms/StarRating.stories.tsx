import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { StarRating } from "../../StarRating";

const meta: Meta<typeof StarRating> = {
  title: "@alexgorbatchev/shadcn/components/forms/StarRating",
  component: StarRating,
  tags: ["autodocs", "test"],
  args: { label: "Track rating", value: 2, onValueChange: fn() },
  render: function Example(args): ReactElement {
    const [value, setValue] = useState(args.value);
    return (
      <StarRating
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          args.onValueChange(next);
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof StarRating>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "4 stars" }));
    await expect(canvas.getByRole("radio", { name: "4 stars" })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(4);
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "5 stars" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Unrated" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(0);
  },
};
export const Compact: Story = {
  args: { density: "compact" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const star = canvas.getByRole("radio", { name: "4 stars" });
    // Compact rows are a single 16-pixel line, so each star target shrinks from 20 to 16 pixels.
    await expect(star.getBoundingClientRect().height).toBe(16);
    await userEvent.click(star);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(4);
  },
};
export const OutsideTabOrder: Story = {
  args: { focusable: false },
  render: function Example(args): ReactElement {
    const [value, setValue] = useState(args.value);
    return (
      <div className="flex items-center gap-2">
        <button type="button">Before</button>
        <StarRating {...args} value={value} onValueChange={setValue} />
        <button type="button">After</button>
      </div>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: "Before" }).focus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
    for (const radio of canvas.getAllByRole("radio")) await expect(radio).toHaveAttribute("tabindex", "-1");
    // The stars stay a pointer affordance.
    await userEvent.click(canvas.getByRole("radio", { name: "5 stars" }));
    await expect(canvas.getByRole("radio", { name: "5 stars" })).toBeChecked();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("radio", { name: "4 stars" }));
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

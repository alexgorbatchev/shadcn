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
type Story = StoryObj<typeof meta>;
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
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("radio", { name: "4 stars" }));
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

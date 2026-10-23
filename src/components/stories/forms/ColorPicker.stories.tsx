import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { useState } from "react";
import { ColorPicker } from "../../color-picker";
const meta: Meta<typeof ColorPicker> = {
  title: "@alexgorbatchev/shadcn/components/forms/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs", "test"],
  args: { label: "Accent", defaultValue: "#ff0000", onValueChange: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: "Accent hex" });
    await userEvent.clear(input);
    await userEvent.type(input, "000000");
    await expect(input).toHaveValue("#000000");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("#000000");
    const hue = c.getByRole("slider", { name: "Hue" });
    await userEvent.click(hue);
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onValueChange).toHaveBeenCalled();
  },
};
export const Alpha: Story = {
  args: { alpha: true, defaultValue: "#ff000000" },
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "11223300");
    await expect(input).toHaveValue("#11223300");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("#11223300");
  },
};
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("#00ff00");
    return (
      <>
        <ColorPicker {...args} value={value} onValueChange={setValue} />
        <output aria-label="Selected color">{value}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.clear(c.getByRole("textbox"));
    await userEvent.type(c.getByRole("textbox"), "000000");
    await expect(c.getByLabelText("Selected color")).toHaveTextContent("#000000");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox")).toBeDisabled();
  },
};

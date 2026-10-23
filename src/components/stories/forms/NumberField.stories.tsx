import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactElement } from "react";
import { expect, fn, within } from "storybook/test";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
} from "../../NumberField";
import { Field, FieldLabel } from "../../Field";
import { Button } from "../../Button";

const meta: Meta<typeof NumberField> = {
  title: "@alexgorbatchev/shadcn/components/forms/NumberField",
  component: NumberField,
  tags: ["autodocs", "test"],
  args: { defaultValue: 2, min: 0, max: 5, onValueChange: fn() },
  render: (args) => (
    <Field>
      <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
      <NumberField {...args} id="quantity">
        <NumberFieldGroup>
          <NumberFieldDecrement aria-label="Decrease quantity" />
          <NumberFieldInput />
          <NumberFieldIncrement aria-label="Increase quantity" />
        </NumberFieldGroup>
      </NumberField>
    </Field>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    await userEvent.click(canvas.getByRole("button", { name: "Increase quantity" }));
    await expect(input).toHaveValue("3");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3, expect.anything());
    await userEvent.click(canvas.getByRole("button", { name: "Decrease quantity" }));
    await expect(input).toHaveValue("2");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("3");
    await userEvent.clear(input);
    await userEvent.type(input, "9");
    await userEvent.tab();
    await expect(input).toHaveValue("5");
    await expect(canvas.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Quantity" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  },
};
export const Formatted: Story = {
  args: { defaultValue: 2.5, max: 100, step: 0.5, format: { style: "currency", currency: "USD" }, locale: "en-US" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Increase quantity" }));
    await expect(canvas.getByRole("textbox", { name: "Quantity" })).toHaveValue("$3.00");
  },
};
function DensityExample(): ReactElement {
  const [compact, setCompact] = useState(false);
  return (
    <>
      <Button onClick={() => setCompact(!compact)}>Toggle density</Button>
      <NumberField id="density-number" density={compact ? "compact" : "comfortable"} defaultValue={3}>
        <NumberFieldScrubArea>
          <label htmlFor="density-number">Review rounds</label>
          <NumberFieldScrubAreaCursor />
        </NumberFieldScrubArea>
        <NumberFieldGroup>
          <NumberFieldDecrement aria-label="Fewer rounds" />
          <NumberFieldInput />
          <NumberFieldIncrement aria-label="More rounds" />
        </NumberFieldGroup>
      </NumberField>
    </>
  );
}
export const DensityAndScrub: Story = {
  render: () => <DensityExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Review rounds" });
    const height = input.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole("button", { name: "Toggle density" }));
    await expect(input.getBoundingClientRect().height).toBeLessThan(height);
    await userEvent.click(canvas.getByRole("button", { name: "More rounds" }));
    await expect(input).toHaveValue("4");
  },
};
export const NativeStateCallbacks: Story = {
  render: (args) => (
    <NumberField {...args} className={() => "gap-2"}>
      <NumberFieldScrubArea className={() => "font-medium"}>Quantity</NumberFieldScrubArea>
      <NumberFieldGroup className={() => "border-input"}>
        <NumberFieldDecrement className={() => "font-medium"} aria-label="Decrease" />
        <NumberFieldInput
          className={() => "text-center"}
          aria-label="Quantity"
          style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
        />
        <NumberFieldIncrement className={() => "font-medium"} aria-label="Increase" />
      </NumberFieldGroup>
    </NumberField>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Increase" }));
    await expect(c.getByRole("textbox", { name: "Quantity" })).toHaveValue("3");
    await expect(c.getByRole("textbox")).toHaveStyle({ opacity: "1" });
  },
};

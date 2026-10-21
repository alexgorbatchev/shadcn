import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ToggleGroup, ToggleGroupItem } from "../../ToggleGroup";
import { DirectionProvider } from "../../DirectionProvider";
import { Field, FieldLabel, FieldDescription } from "../../Field";
import { useState } from "react";

const meta: Meta<typeof ToggleGroup> = {
  title: "@alexgorbatchev/shadcn/components/actions/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Text formatting", defaultValue: ["bold"], onValueChange: fn() },
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    spacing: { control: "number" },
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline" disabled>
        Underline
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Single: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Italic" }));
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
    await expect(args.onValueChange).toHaveBeenCalledWith(["italic"], expect.anything());
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
    await expect(canvas.getByRole("button", { name: "Underline" })).toBeDisabled();
  },
};
export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Italic" }));
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
    await expect(args.onValueChange).toHaveBeenCalledWith(["bold", "italic"], expect.anything());
  },
};
export const JoinedOutline: Story = {
  args: { spacing: 0, variant: "outline", size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "Bold" });
    const middle = canvas.getByRole("button", { name: "Italic" });
    const last = canvas.getByRole("button", { name: "Underline" });
    await expect(first.getBoundingClientRect().right).toBeCloseTo(middle.getBoundingClientRect().left, 1);
    await expect(Number.parseFloat(getComputedStyle(first).borderInlineStartWidth)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(middle).borderInlineStartWidth)).toBe(0);
    await expect(Number.parseFloat(getComputedStyle(first).borderStartStartRadius)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(first).borderStartEndRadius)).toBe(0);
    await expect(Number.parseFloat(getComputedStyle(last).borderStartEndRadius)).toBeGreaterThan(0);
    await userEvent.click(middle);
    await expect(middle).toHaveAttribute("aria-pressed", "true");
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical", size: "lg" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Bold" }).getBoundingClientRect().bottom).toBeLessThan(
      canvas.getByRole("button", { name: "Italic" }).getBoundingClientRect().top,
    );
    await expect(canvas.getByRole("button", { name: "Bold" }).getBoundingClientRect().width).toBe(
      canvas.getByRole("button", { name: "Underline" }).getBoundingClientRect().width,
    );
    await userEvent.click(canvas.getByRole("button", { name: "Bold" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
  },
};
export const StateCallback: Story = {
  args: { className: fn(() => ""), style: fn(() => ({ gap: "8px" })) },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Italic" }));
    await expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ orientation: "horizontal" }));
    await expect(args.style).toHaveBeenCalledWith(expect.objectContaining({ orientation: "horizontal" }));
  },
};

export const JoinedVertical: Story = {
  args: { orientation: "vertical", spacing: 0, variant: "outline" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "Bold" });
    const next = canvas.getByRole("button", { name: "Italic" });
    const last = canvas.getByRole("button", { name: "Underline" });
    await expect(first.getBoundingClientRect().bottom).toBeCloseTo(next.getBoundingClientRect().top, 1);
    await expect(Number.parseFloat(getComputedStyle(first).borderTopWidth)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(next).borderTopWidth)).toBe(0);
    await expect(Number.parseFloat(getComputedStyle(first).borderTopLeftRadius)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(first).borderBottomLeftRadius)).toBe(0);
    await expect(Number.parseFloat(getComputedStyle(last).borderBottomLeftRadius)).toBeGreaterThan(0);
    await userEvent.click(first);
    await userEvent.keyboard("{ArrowDown}");
    await expect(next).toHaveFocus();
  },
};

export const Spacing: Story = {
  args: { spacing: 4, variant: "outline" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "Bold" });
    const next = canvas.getByRole("button", { name: "Italic" });
    await expect(next.getBoundingClientRect().left - first.getBoundingClientRect().right).toBe(16);
    await expect(Number.parseFloat(getComputedStyle(next).borderInlineStartWidth)).toBeGreaterThan(0);
    await userEvent.click(next);
    await expect(next).toHaveAttribute("aria-pressed", "true");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Bold" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Italic" })).toBeDisabled();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Bold" })).not.toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
export const Custom: Story = {
  render: function Render() {
    const [weight, setWeight] = useState("normal");
    return (
      <Field>
        <FieldLabel id="font-weight-label">Font weight</FieldLabel>
        <ToggleGroup
          aria-labelledby="font-weight-label"
          value={[weight]}
          onValueChange={(value) => setWeight(value[0] ?? "normal")}
          variant="outline"
          spacing={2}
          size="lg"
        >
          <ToggleGroupItem value="light" aria-label="Light" className="flex size-16 flex-col">
            <span>Aa</span>
            <span>Light</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="normal" aria-label="Normal" className="flex size-16 flex-col">
            <span>Aa</span>
            <span>Normal</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="bold" aria-label="Bold" className="flex size-16 flex-col">
            <span>Aa</span>
            <span>Bold</span>
          </ToggleGroupItem>
        </ToggleGroup>
        <FieldDescription>Selected weight: {weight}</FieldDescription>
      </Field>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = within(canvas.getByRole("group", { name: "Font weight" }));
    await expect(group.getByRole("button", { name: "Normal" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(group.getByRole("button", { name: "Bold" }));
    await expect(group.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByText("Selected weight: bold")).toBeVisible();
    await expect(group.getByRole("button", { name: "Bold" }).getBoundingClientRect().height).toBe(64);
  },
};
export const RightToLeft: Story = {
  args: { spacing: 0, variant: "outline" },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <ToggleGroup {...args} dir="rtl">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
      </ToggleGroup>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "Bold" });
    const next = canvas.getByRole("button", { name: "Italic" });
    const last = canvas.getByRole("button", { name: "Underline" });
    await expect(first.getBoundingClientRect().left).toBeCloseTo(next.getBoundingClientRect().right, 1);
    await expect(Number.parseFloat(getComputedStyle(next).borderInlineStartWidth)).toBe(0);
    await expect(Number.parseFloat(getComputedStyle(first).borderStartStartRadius)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(first).borderStartEndRadius)).toBe(0);
    await expect(Number.parseFloat(getComputedStyle(last).borderStartEndRadius)).toBeGreaterThan(0);
    await userEvent.click(first);
    await userEvent.keyboard("{ArrowLeft}");
    await expect(next).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(next).toHaveAttribute("aria-pressed", "true");
  },
};

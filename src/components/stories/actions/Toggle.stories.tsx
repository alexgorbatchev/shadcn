import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Toggle } from "../../Toggle";
import { BookmarkIcon } from "lucide-react";

const meta: Meta<typeof Toggle> = {
  title: "@alexgorbatchev/shadcn/components/actions/Toggle",
  component: Toggle,
  tags: ["autodocs", "test"],
  args: { children: "Bold", "aria-label": "Bold", onPressedChange: fn() },
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Bold" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledWith(true, expect.anything());
    await userEvent.keyboard(" ");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};
export const Outline: Story = { ...Default, args: { variant: "outline" } };
export const Small: Story = { ...Default, args: { size: "sm" } };
export const Large: Story = { ...Default, args: { size: "lg" } };
export const Compact: Story = { ...Default, args: { density: "compact" } };
export const Pressed: Story = {
  args: { defaultPressed: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Bold" });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Bold" });
    await expect(button).toBeDisabled();
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};
export const StateCallback: Story = {
  args: { className: fn(() => "font-normal") },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Bold" }));
    await expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ pressed: true, disabled: false }));
  },
};

export const IconOnly: Story = {
  args: { children: <BookmarkIcon aria-hidden="true" />, "aria-label": "Bookmark" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Bookmark" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <Toggle {...args} dir="ltr" aria-label="Bookmark LTR">
        <BookmarkIcon data-icon="inline-start" />
        <span>Bookmark</span>
      </Toggle>
      <Toggle {...args} dir="rtl" aria-label="Bookmark RTL">
        <BookmarkIcon data-icon="inline-start" />
        <span>Bookmark</span>
      </Toggle>
      <Toggle {...args} dir="ltr" aria-label="Trailing LTR">
        <span>Bookmark</span>
        <BookmarkIcon data-icon="inline-end" />
      </Toggle>
      <Toggle {...args} dir="rtl" aria-label="Trailing RTL">
        <span>Bookmark</span>
        <BookmarkIcon data-icon="inline-end" />
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ltr = canvas.getByRole("button", { name: "Bookmark LTR" });
    const rtl = canvas.getByRole("button", { name: "Bookmark RTL" });
    const ltrIcon = ltr.querySelector("svg") as SVGElement;
    const rtlIcon = rtl.querySelector("svg") as SVGElement;
    await expect(rtlIcon.getBoundingClientRect().left).toBeGreaterThan(
      within(rtl).getByText("Bookmark").getBoundingClientRect().right,
    );
    await expect(getComputedStyle(rtl).paddingInlineStart).toBe(getComputedStyle(ltr).paddingInlineStart);
    await expect(getComputedStyle(rtl).paddingInlineEnd).toBe(getComputedStyle(ltr).paddingInlineEnd);
    await expect(rtl.getBoundingClientRect().right - rtlIcon.getBoundingClientRect().right).toBeCloseTo(
      ltrIcon.getBoundingClientRect().left - ltr.getBoundingClientRect().left,
      1,
    );
    const trailingLtr = canvas.getByRole("button", { name: "Trailing LTR" });
    const trailingRtl = canvas.getByRole("button", { name: "Trailing RTL" });
    const trailingLtrIcon = trailingLtr.querySelector("svg") as SVGElement;
    const trailingRtlIcon = trailingRtl.querySelector("svg") as SVGElement;
    await expect(trailingRtlIcon.getBoundingClientRect().right).toBeLessThan(
      within(trailingRtl).getByText("Bookmark").getBoundingClientRect().left,
    );
    await expect(getComputedStyle(trailingRtl).paddingInlineStart).toBe(
      getComputedStyle(trailingLtr).paddingInlineStart,
    );
    await expect(getComputedStyle(trailingRtl).paddingInlineEnd).toBe(getComputedStyle(trailingLtr).paddingInlineEnd);
    await expect(trailingRtlIcon.getBoundingClientRect().left - trailingRtl.getBoundingClientRect().left).toBeCloseTo(
      trailingLtr.getBoundingClientRect().right - trailingLtrIcon.getBoundingClientRect().right,
      1,
    );
    await userEvent.click(rtl);
    await expect(rtl).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
    await expect(rtl).toHaveAttribute("aria-pressed", "false");
  },
};
export const SmallRightToLeft: Story = { ...RightToLeft, args: { size: "sm" } };
export const LargeRightToLeft: Story = { ...RightToLeft, args: { size: "lg" } };

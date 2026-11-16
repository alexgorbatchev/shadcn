import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { useState } from "react";
import { ImageZoomToggle, type ImageZoom } from "../../image-viewer";

const meta: Meta<typeof ImageZoomToggle> = {
  title: "@alexgorbatchev/shadcn/components/data-display/ImageZoomToggle",
  component: ImageZoomToggle,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'Import from `@alexgorbatchev/shadcn/image-viewer`. A two-option toggle for ImageViewer and ImageComparison zoom that consumers place in a header or toolbar. "Fit to screen" and "Original size" are pressed-state toggles with constant names, so assistive technology announces the active zoom through `aria-pressed`. One option always stays pressed. `label` names the group (default "Zoom"); `size`, `orientation`, `layout`, `disabled`, and `density` follow ToggleGroup.',
      },
    },
  },
  args: { zoom: "fit", onZoomChange: fn() },
  argTypes: {
    zoom: { control: "inline-radio", options: ["fit", "original"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    layout: { control: "inline-radio", options: ["content", "fill"] },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
  render: function Render(args) {
    const [zoom, setZoom] = useState<ImageZoom>(args.zoom);
    return (
      <ImageZoomToggle
        {...args}
        zoom={zoom}
        onZoomChange={(next) => {
          setZoom(next);
          args.onZoomChange(next);
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof ImageZoomToggle>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const fit = canvas.getByRole("button", { name: "Fit to screen" });
    const original = canvas.getByRole("button", { name: "Original size" });
    await expect(canvas.getByRole("group", { name: "Zoom" })).toBeVisible();
    await expect(fit).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(original);
    await expect(original).toHaveAttribute("aria-pressed", "true");
    await expect(fit).toHaveAttribute("aria-pressed", "false");
    await expect(args.onZoomChange).toHaveBeenLastCalledWith("original");
    await userEvent.click(original);
    await expect(original).toHaveAttribute("aria-pressed", "true");
    await expect(args.onZoomChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{ArrowLeft} ");
    await expect(fit).toHaveAttribute("aria-pressed", "true");
    await expect(args.onZoomChange).toHaveBeenLastCalledWith("fit");
  },
};

export const VerticalFill: Story = {
  args: { orientation: "vertical", layout: "fill", label: "Screenshot zoom", zoom: "original" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Screenshot zoom" });
    const fit = canvas.getByRole("button", { name: "Fit to screen" });
    const original = canvas.getByRole("button", { name: "Original size" });
    await expect(group).toBeVisible();
    await expect(original).toHaveAttribute("aria-pressed", "true");
    await expect(fit.getBoundingClientRect().bottom).toBeCloseTo(original.getBoundingClientRect().top, 1);
    await expect(fit.getBoundingClientRect().width).toBeCloseTo(group.getBoundingClientRect().width, 1);
    await userEvent.click(original);
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect(fit).toHaveAttribute("aria-pressed", "true");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const original = canvas.getByRole("button", { name: "Original size" });
    await expect(original).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Fit to screen" })).toBeDisabled();
    await userEvent.tab();
    await expect(original).not.toHaveFocus();
    await expect(original).toHaveAttribute("aria-pressed", "false");
    await expect(args.onZoomChange).not.toHaveBeenCalled();
  },
};

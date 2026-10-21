import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { Diagram } from "../../../assistant-ui/elements/Diagram.js";
const meta: Meta<typeof Diagram> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Diagram",
  component: Diagram,
  tags: ["autodocs", "test"],
  args: {
    title: "Request lifecycle",
    zoom: 1,
    children: "Request → Service → Response",
    onZoomIn: fn(),
    onZoomOut: fn(),
    onReset: fn(),
    onExpand: fn(),
  },
  render: function Interactive(args) {
    const [zoom, setZoom] = useState(args.zoom);
    return (
      <Diagram
        {...args}
        zoom={zoom}
        onZoomIn={
          args.onZoomIn &&
          (() => {
            args.onZoomIn?.();
            setZoom((value) => value + 0.25);
          })
        }
        onZoomOut={
          args.onZoomOut &&
          (() => {
            args.onZoomOut?.();
            setZoom((value) => value - 0.25);
          })
        }
        onReset={
          args.onReset &&
          (() => {
            args.onReset?.();
            setZoom(1);
          })
        }
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Controls: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => expect(canvas.getByText("125%")).toBeVisible());
    await expect(args.onZoomIn).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Reset the view" }));
    await waitFor(() => expect(canvas.getByText("100%")).toBeVisible());
    await expect(args.onReset).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Zoom out" }));
    await waitFor(() => expect(canvas.getByText("75%")).toBeVisible());
    await expect(args.onZoomOut).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Open full screen" }));
    await expect(args.onExpand).toHaveBeenCalledTimes(1);
  },
};
export const ReadOnly: Story = {
  args: { onZoomIn: undefined, onZoomOut: undefined, onReset: undefined, onExpand: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Request → Service → Response")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Zoom in" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Zoom out" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Reset the view" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Open full screen" })).toBeDisabled();
  },
};

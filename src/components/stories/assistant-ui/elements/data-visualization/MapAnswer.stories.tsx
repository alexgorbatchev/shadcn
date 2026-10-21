import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MapAnswer } from "../../../../assistant-ui/elements/MapAnswer.js";
const meta: Meta<typeof MapAnswer> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/MapAnswer",
  component: MapAnswer,
  tags: ["autodocs", "test"],
  args: {
    pins: [
      { id: "first", label: "Station", detail: "Start", x: 20, y: 30 },
      { id: "last", label: "Office", detail: "Destination", x: 80, y: 70 },
    ],
    activeId: "first",
    route: true,
    onSelect: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const SelectPin: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Station" })).toHaveAttribute("aria-current", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Office" }));
    await expect(args.onSelect).toHaveBeenCalledWith("last");
    await userEvent.click(canvas.getByRole("button", { name: "Office Destination" }));
    await expect(args.onSelect).toHaveBeenCalledTimes(2);
  },
};
export const ReadOnly: Story = {
  args: { onSelect: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Office" })).toBeVisible();
    await expect(canvas.getByText("Destination")).toBeVisible();
  },
};
export const Empty: Story = {
  args: { pins: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.getByTestId("MapAnswer")).toBeVisible();
  },
};

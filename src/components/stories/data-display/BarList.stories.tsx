import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { BarList } from "../../BarList";
const items = [
  { id: "direct", label: "Direct", value: 120 },
  { id: "search", label: "Search", value: 80 },
];
const meta: Meta<typeof BarList> = {
  title: "@alexgorbatchev/shadcn/components/data-display/BarList",
  component: BarList,
  tags: ["autodocs", "test"],
  args: { label: "Traffic sources", items, onItemSelect: fn() },
};
export default meta;
type Story = StoryObj<typeof BarList>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("meter", { name: "Direct" })).toHaveAttribute("aria-valuenow", "120");
    await userEvent.click(c.getByRole("button", { name: "Search" }));
    await expect(args.onItemSelect).toHaveBeenCalledWith(items[1]);
  },
};
export const ReadOnly: Story = {
  args: { onItemSelect: undefined, valueFormatter: (value) => `${value} visits` },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("120 visits")).toBeVisible();
    await expect(c.queryByRole("button")).not.toBeInTheDocument();
  },
};
// Each label row sits just above its bar, with the value at the bar's end.
export const Layout: Story = {
  args: { onItemSelect: undefined },
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole("meter", { name: "Direct" });
    const row = meter.firstElementChild;
    const track = meter.querySelector("[data-slot='meter-track']");
    if (!(row instanceof HTMLElement) || !(track instanceof HTMLElement)) {
      throw new Error("BarList item is missing its label row or track");
    }
    const rowBox = row.getBoundingClientRect();
    const trackBox = track.getBoundingClientRect();
    await expect(trackBox.top - rowBox.bottom).toBeLessThanOrEqual(4);
    await expect(Math.abs(rowBox.right - trackBox.right)).toBeLessThanOrEqual(1);
  },
};
export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("No data available.");
  },
};

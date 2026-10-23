import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Sparkline } from "../../chart";
const meta: Meta<typeof Sparkline> = {
  title: "@alexgorbatchev/shadcn/components/data-display/Sparkline",
  component: Sparkline,
  tags: ["autodocs", "test"],
  args: { label: "Weekly revenue", values: [4, 6, 3, 8, 10] },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Line: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "Weekly revenue: 4, 6, 3, 8, 10" })).toBeVisible();
  },
};
export const Area: Story = { args: { type: "area" }, play: Line.play };
export const Bar: Story = { args: { type: "bar" }, play: Line.play };

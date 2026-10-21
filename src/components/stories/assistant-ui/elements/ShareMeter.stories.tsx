import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ShareMeter } from "../../../assistant-ui/elements/ShareMeter.js";
const meta: Meta<typeof ShareMeter> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ShareMeter",
  component: ShareMeter,
  tags: ["autodocs", "test"],
  args: { label: "Context used", percentage: 45, valueText: "450 of 1,000 tokens" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Partial: Story = {
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole("meter", { name: "Context used" });
    await expect(meter).toHaveAttribute("value", "45");
    await expect(meter).toHaveAttribute("aria-valuetext", "450 of 1,000 tokens");
  },
};
export const AtCapacity: Story = {
  args: { percentage: 120, tone: "warning", valueText: "1,200 of 1,000 tokens" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("meter", { name: "Context used" })).toHaveAttribute("value", "100");
  },
};
export const Empty: Story = {
  args: { percentage: Number.NaN, valueText: "No usage recorded" },
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole("meter", { name: "Context used" });
    await expect(meter).toHaveAttribute("value", "0");
    await expect(meter).toHaveAttribute("aria-valuetext", "No usage recorded");
  },
};

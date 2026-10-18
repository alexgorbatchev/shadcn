import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DragDropPreview } from "../DragDropPreview";

const meta: Meta<typeof DragDropPreview> = {
  title: "shadcn-alexgorbatchev/components/DragDropPreview",
  component: DragDropPreview,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { labels: ["First light"] },
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText("First light");
    await expect(label).toBeVisible();
    await expect(label.closest("[data-slot=badge]")!.getBoundingClientRect().height).toBeLessThanOrEqual(24);
  },
};
export const Overflow: Story = {
  args: { labels: Array.from({ length: 15 }, (_, index) => `Track ${index + 1}`) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Track 5")).toBeVisible();
    await expect(canvas.queryByText("Track 6")).not.toBeInTheDocument();
    await expect(canvas.getByText("+10 more…")).toBeVisible();
    await expect(canvasElement.querySelectorAll("[data-slot=badge]")).toHaveLength(6);
  },
};
export const CustomLimit: Story = {
  args: { labels: ["One", "Two", "Three"], maxItems: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("+2 more…")).toBeVisible();
    await expect(canvasElement.querySelectorAll("[data-slot=badge]")).toHaveLength(2);
  },
};

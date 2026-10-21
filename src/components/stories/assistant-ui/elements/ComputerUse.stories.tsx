import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ComputerUse } from "../../../assistant-ui/elements/ComputerUse.js";
const meta: Meta<typeof ComputerUse> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComputerUse",
  component: ComputerUse,
  tags: ["autodocs", "test"],
  args: {
    url: "https://example.com",
    steps: [
      { id: "open", action: "Click", target: "Open settings", x: 20, y: 30 },
      { id: "save", action: "Click", target: "Save settings", x: 70, y: 60 },
    ],
    activeIndex: 1,
    children: <p>Application preview</p>,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const ActiveStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Save settings")).toBeVisible();
    await expect(canvas.queryByText("Open settings")).not.toBeInTheDocument();
    await expect(canvas.getByText("2/2")).toBeVisible();
    await expect(canvas.getByText("Application preview")).toBeVisible();
  },
};
export const OutOfBounds: Story = {
  args: { activeIndex: 100 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Save settings")).toBeVisible();
    await expect(within(canvasElement).getByText("2/2")).toBeVisible();
  },
};
export const Empty: Story = {
  args: { steps: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Application preview")).toBeVisible();
    await expect(canvas.queryByText("Save settings")).not.toBeInTheDocument();
    await expect(canvas.queryByText("2/2")).not.toBeInTheDocument();
  },
};

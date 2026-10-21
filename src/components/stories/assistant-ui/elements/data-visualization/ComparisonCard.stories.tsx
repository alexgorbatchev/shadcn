import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ComparisonCard } from "../../../../assistant-ui/elements/ComparisonCard.js";
const meta: Meta<typeof ComparisonCard> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/ComparisonCard",
  component: ComparisonCard,
  tags: ["autodocs", "test"],
  args: {
    traitLabels: ["Speed", "Offline"],
    options: [
      { id: "fast", name: "Fast", headline: "Low latency", traits: ["Quick", false] },
      { id: "local", name: "Local", headline: "Runs on device", traits: ["Steady", "Available"] },
    ],
    recommendedId: "local",
    reason: "Choose local when working offline.",
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Recommendation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("pick").parentElement).toHaveTextContent("Local");
    await expect(canvas.getByText("Offline")).toBeVisible();
    await expect(canvas.getByText("Available")).toBeVisible();
    await expect(canvas.getByText("Choose local when working offline.")).toBeVisible();
  },
};
export const NoRecommendation: Story = {
  args: { recommendedId: "" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText("pick")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { options: [], reason: "No options available" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No options available")).toBeVisible();
  },
};

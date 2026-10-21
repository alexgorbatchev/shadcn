import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { ContextBreakdown } from "../../../../assistant-ui/elements/ContextBreakdown.js";
const meta: Meta<typeof ContextBreakdown> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/context/ContextBreakdown",
  component: ContextBreakdown,
  tags: ["autodocs", "test"],
  args: {
    limit: 1000,
    segments: [
      { label: "Conversation", tokens: 400, tone: "primary" },
      { label: "Files", tokens: 250, tone: "success" },
      { label: "Instructions", tokens: 100, tone: "warning" },
      { label: "Tools", tokens: 50, tone: "muted" },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Used: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("800 / 1,000")).toBeVisible());
    await expect(canvas.getByRole("meter", { name: "Conversation context usage" })).toHaveAttribute("value", "40");
    await expect(canvas.getByRole("meter", { name: "Files context usage" })).toHaveAttribute(
      "aria-valuetext",
      "250 of 1,000",
    );
    await waitFor(() => expect(canvas.getByText("200")).toBeVisible());
  },
};
export const AboveCapacity: Story = {
  args: { segments: [{ label: "Conversation", tokens: 1200, tone: "warning" }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("meter", { name: "Conversation context usage" })).toHaveAttribute("value", "100");
    await waitFor(() => expect(canvas.getByText("1,200 / 1,000")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("0")).toBeVisible());
  },
};
export const Empty: Story = {
  args: { limit: 0, segments: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("0 / 0")).toBeVisible());
    await expect(canvas.queryByRole("meter")).not.toBeInTheDocument();
  },
};

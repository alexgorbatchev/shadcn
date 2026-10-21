import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { OptionText } from "../../../../assistant-ui/elements/OptionText.js";

const meta: Meta<typeof OptionText> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/OptionText",
  component: OptionText,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Label: Story = {
  args: { option: { id: "compact", label: "Compact" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Compact")).toBeVisible();
  },
};
export const WithDescription: Story = {
  args: { option: { id: "compact", label: "Compact", description: "Keep the page visible" }, isPadded: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Compact")).toBeVisible();
    await expect(within(canvasElement).getByText("Keep the page visible")).toBeVisible();
  },
};

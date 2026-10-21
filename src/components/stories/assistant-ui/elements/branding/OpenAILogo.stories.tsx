import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { OpenAILogo } from "../../../../assistant-ui/elements/OpenAILogo.js";
const meta: Meta<typeof OpenAILogo> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/branding/OpenAILogo",
  component: OpenAILogo,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("OpenAILogo")).toBeVisible();
  },
};
export const Small: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("OpenAILogo")).toBeVisible();
  },
};

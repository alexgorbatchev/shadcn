import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ClaudeLogo } from "../../../assistant-ui/elements/ClaudeLogo.js";
const meta: Meta<typeof ClaudeLogo> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ClaudeLogo",
  component: ClaudeLogo,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("ClaudeLogo")).toBeVisible();
  },
};
export const Small: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("ClaudeLogo")).toBeVisible();
  },
};

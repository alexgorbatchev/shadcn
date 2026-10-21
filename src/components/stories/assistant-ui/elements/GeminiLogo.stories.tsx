import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { GeminiLogo } from "../../../assistant-ui/elements/GeminiLogo.js";
const meta: Meta<typeof GeminiLogo> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/GeminiLogo",
  component: GeminiLogo,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("GeminiLogo")).toBeVisible();
  },
};
export const Small: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("GeminiLogo")).toBeVisible();
  },
};
export const IndependentInstances: Story = {
  render: () => (
    <>
      <GeminiLogo />
      <GeminiLogo />
    </>
  ),
  play: async ({ canvasElement }) => {
    const logos = within(canvasElement).getAllByTestId("GeminiLogo");
    await expect(logos).toHaveLength(2);
    await expect(new Set(logos.map((logo) => logo.getAttribute("fill"))).size).toBe(2);
  },
};

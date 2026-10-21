import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Frac } from "../../../assistant-ui/elements/Frac.js";
const meta: Meta<typeof Frac> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Frac",
  component: Frac,
  tags: ["autodocs", "test"],
  args: { over: "numerator", under: "denominator" },
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const numerator = canvas.getByText("numerator");
    const denominator = canvas.getByText("denominator");
    await expect(canvas.getByRole("math").getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(numerator.getBoundingClientRect().bottom).toBeLessThan(denominator.getBoundingClientRect().top);
  },
};
export { Default as Frac };

import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ScoreBreakdown } from "../../../../assistant-ui/elements/ScoreBreakdown.js";
const meta: Meta<typeof ScoreBreakdown> = {
  component: ScoreBreakdown,
  render: (args) => <ScoreBreakdown {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/ScoreBreakdown",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    verdict: "Ready for review",
    total: 90,
    outOf: 100,
    criteria: [{ label: "Correctness", score: 90, weight: 1, note: "Checks passed" }],
    visibleCount: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Correctness")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Checks passed")).toBeVisible());
    await expect((canvas.getByRole("meter", { name: "Correctness score" }) as HTMLMeterElement).value).toBe(90);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

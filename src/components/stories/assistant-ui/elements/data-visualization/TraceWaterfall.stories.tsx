import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { TraceWaterfall } from "../../../../assistant-ui/elements/TraceWaterfall.js";
const meta: Meta<typeof TraceWaterfall> = {
  component: TraceWaterfall,
  render: (args) => <TraceWaterfall {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/TraceWaterfall",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    spans: [{ id: "one", name: "Read source", depth: 0, startMs: 0, durationMs: 100, status: "completed" }],
    totalMs: 200,
    visibleCount: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Read source")).toBeVisible());
  },
};
export const FailedSpan: Story = {
  ...Default,
  args: {
    ...Default.args,
    spans: [{ id: "one", name: "Read source", depth: 0, startMs: 0, durationMs: 100, status: "failed" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("img", { name: "failed, starts at 0ms, runs 100ms" })).toBeInTheDocument();
  },
};
export const RunningSpan: Story = {
  ...Default,
  args: {
    ...Default.args,
    spans: [{ id: "one", name: "Read source", depth: 1, startMs: 10, durationMs: 100, status: "running" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("img", { name: "running, starts at 10ms, runs 100ms" })).toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

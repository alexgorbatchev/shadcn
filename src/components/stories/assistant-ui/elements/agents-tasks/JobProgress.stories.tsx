import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { JobProgress } from "../../../../assistant-ui/elements/JobProgress.js";
const meta: Meta<typeof JobProgress> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/agents-tasks/JobProgress",
  component: JobProgress,
  tags: ["autodocs", "test"],
  args: {
    title: "Build",
    stages: [
      { name: "Read", weight: 1 },
      { name: "Write", weight: 3, description: "Updating files" },
    ],
    stageIndex: 1,
    stageProgress: 0.5,
    eta: "30s remaining",
    onCancel: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Running: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar", { name: "Build progress" })).toHaveAttribute("aria-valuenow", "62.5");
    await expect(canvas.getByRole("status")).toHaveTextContent("Current stage: Write");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel the job" }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
export const Success: Story = {
  args: { outcome: { status: "success", summary: "Build completed" }, elapsedMs: 125000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    await expect(canvas.getByRole("status")).toHaveTextContent("Job done");
    await expect(canvas.getByText("2m 5s")).toHaveAttribute("datetime", "PT125S");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Partial: Story = {
  args: { outcome: { status: "partial", summary: "One file skipped" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Job partly done");
    await expect(canvas.getByText("One file skipped")).toBeVisible();
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "62.5");
  },
};
export const Failed: Story = {
  args: { outcome: { status: "failed", summary: "Compiler error" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Job failed");
    await expect(within(canvasElement).getByText("Compiler error")).toBeVisible();
  },
};
export const Cancelled: Story = {
  args: { outcome: { status: "cancelled" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Job cancelled");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Finished: Story = {
  args: { stageIndex: 2 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Job done");
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CodeRunner } from "../../../../assistant-ui/elements/CodeRunner.js";
const meta: Meta<typeof CodeRunner> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/CodeRunner",
  component: CodeRunner,
  tags: ["autodocs", "test"],
  args: { language: "javascript", code: "console.log(2 + 2)", state: "idle", output: [], onRun: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Run: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Run this snippet" }));
    await expect(args.onRun).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole("log")).not.toBeInTheDocument();
  },
};
export const Running: Story = {
  args: { state: "running", output: ["Starting"] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Run this snippet" })).toBeDisabled();
    await expect(canvas.getByRole("log", { name: "Code output" })).toHaveTextContent("Starting");
  },
};
export const Complete: Story = {
  args: { state: "ok", output: ["4"], durationMs: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("log")).toHaveTextContent("4");
    await expect(canvas.getByText("12ms")).toBeVisible();
  },
};
export const Error: Story = {
  args: { state: "error", output: ["ReferenceError: missing is not defined"] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("log")).toHaveTextContent("ReferenceError: missing is not defined");
  },
};
export const ReadOnly: Story = {
  args: { onRun: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};

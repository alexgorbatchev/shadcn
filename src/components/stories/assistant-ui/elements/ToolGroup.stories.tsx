import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { ToolGroup } from "../../../assistant-ui/elements/ToolGroup.js";
const meta: Meta<typeof ToolGroup> = {
  component: ToolGroup,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ToolGroup",
  render: (args) => <ToolGroup {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    label: "Workspace inspection",
    tools: [{ id: "one", name: "read_file", target: "package.json", state: "done", durationMs: 100 }],
    open: false,
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Workspace inspection/ }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

export const RunningTools: Story = {
  args: {
    label: "Workspace inspection",
    open: true,
    tools: [
      { id: "read", name: "read_file", target: "package.json", state: "done", durationMs: 100 },
      { id: "test", name: "test", target: "Browser checks", state: "running" },
      { id: "lint", name: "lint", target: "Source checks", state: "failed" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2/3")).toBeVisible();
    await waitFor(() => expect(canvas.getByText("100ms")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Browser checks")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Source checks")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const FailedTools: Story = {
  ...RunningTools,
  args: { ...RunningTools.args, tools: [{ id: "lint", name: "lint", target: "Source checks", state: "failed" }] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("1 failed")).toBeVisible();
  },
};
export const CompletedTools: Story = {
  ...RunningTools,
  args: { ...RunningTools.args, tools: [{ id: "read", name: "read_file", target: "package.json", state: "done" }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("1 done")).toBeVisible();
    await waitFor(() => expect(canvas.getByText("package.json")).toBeVisible());
  },
};

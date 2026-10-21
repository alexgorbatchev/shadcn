import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn } from "storybook/test";
import { ToolError } from "../../../assistant-ui/elements/ToolError.js";
const meta: Meta<typeof ToolError> = {
  component: ToolError,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ToolError",
  render: (args) => <ToolError {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    name: "read_file",
    target: "package.json",
    message: "Access denied",
    attempt: 1,
    maxAttempts: 3,
    retrying: false,
    onRetry: fn(),
    onSkip: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await expect(args.onSkip).toHaveBeenCalledOnce();
  },
};
export const Retrying: Story = {
  ...Default,
  args: { ...Default.args, retrying: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Retrying" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await expect(args.onSkip).toHaveBeenCalledOnce();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

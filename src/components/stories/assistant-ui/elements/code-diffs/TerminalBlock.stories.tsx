import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, userEvent } from "storybook/test";
import Color from "colorjs.io";
import { TerminalBlock } from "../../../../assistant-ui/elements/TerminalBlock.js";
const meta: Meta<typeof TerminalBlock> = {
  component: TerminalBlock,
  render: (args) => <TerminalBlock {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/code-diffs/TerminalBlock",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    command: "bun test",
    lines: ["First test passed", "Second test passed"],
    visibleCount: 2,
    done: true,
    maxCollapsedLines: 1,
    durationMs: 2000,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("bun test")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /Show/ }));
    await waitFor(() => expect(canvas.getByText("Second test passed")).toBeVisible());
  },
};
export const Failed: Story = {
  ...Default,
  args: {
    ...Default.args,
    lines: ["Compilation failed"],
    visibleCount: 2,
    exitCode: 1,
    stderr: ["Invalid source"],
    maxCollapsedLines: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Compilation failed")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Invalid source")).toBeVisible());
  },
};
export const Running: Story = {
  ...Default,
  args: { ...Default.args, done: false, maxCollapsedLines: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("TerminalBlock")).toHaveAttribute("data-state", "running");
  },
};
export const Ink: Story = {
  ...Default,
  args: {
    ...Default.args,
    variant: "ink",
    lines: ["ANSI \u001b[31mred\u001b[0m output"],
    maxCollapsedLines: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const terminal = canvas.getByTestId("TerminalBlock");
    await expect(terminal).toHaveAttribute("data-state", "done");
    const red = canvas.getByText("red");
    await waitFor(() =>
      expect(
        new Color(getComputedStyle(red).color).contrastWCAG21(getComputedStyle(terminal).backgroundColor),
      ).toBeGreaterThanOrEqual(4.5),
    );
  },
};
export const LightAnsi: Story = { ...Ink, globals: { theme: "light" }, play: Ink.play };
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

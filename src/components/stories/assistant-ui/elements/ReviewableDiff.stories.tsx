import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ReviewableDiff } from "../../../assistant-ui/elements/ReviewableDiff.js";
const meta: Meta<typeof ReviewableDiff> = {
  component: ReviewableDiff,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ReviewableDiff",
  render: (args) => <ReviewableDiff {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    filename: "src/workspace.ts",
    hunks: [
      {
        id: "one",
        range: "1–2",
        decision: "pending",
        lines: [
          { kind: "removed", text: "const ready = false;" },
          { kind: "added", text: "const ready = true;" },
        ],
      },
    ],
    onKeep: fn(),
    onDiscard: fn(),
    onApply: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Keep hunk 1–2" }));
    await expect(args.onKeep).toHaveBeenCalledWith("one");
    await userEvent.click(canvas.getByRole("button", { name: "Discard hunk 1–2" }));
    await expect(args.onDiscard).toHaveBeenCalledWith("one");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

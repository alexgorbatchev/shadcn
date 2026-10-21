import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ComposerBar } from "../../../assistant-ui/elements/ComposerBar.js";
import { ComposerInput } from "../../../assistant-ui/elements/ComposerInput.js";
const meta: Meta<typeof ComposerBar> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerBar",
  component: ComposerBar,
  tags: ["autodocs", "test"],
  args: { children: <ComposerInput aria-label="Message" /> },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "Review this change");
    await expect(input).toHaveValue("Review this change");
  },
};
export const Dragging: Story = {
  args: { dragActive: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ComposerBar")).toHaveAttribute("data-drag-active", "true");
    const input = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "Drop a file here");
    await expect(input).toHaveValue("Drop a file here");
  },
};

import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { TypingIndicator } from "../../../../assistant-ui/elements/TypingIndicator.js";
const meta: Meta<typeof TypingIndicator> = {
  component: TypingIndicator,
  render: (args) => <TypingIndicator {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/reasoning/TypingIndicator",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { variant: "bare" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("status", { name: "Assistant is typing" })).toBeVisible());
  },
};
export const Bubble: Story = {
  ...Default,
  args: { ...Default.args, variant: "bubble" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("status", { name: "Assistant is typing" })).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

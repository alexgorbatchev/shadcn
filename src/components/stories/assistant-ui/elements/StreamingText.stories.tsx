import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { StreamingText } from "../../../assistant-ui/elements/StreamingText.js";
const meta: Meta<typeof StreamingText> = {
  component: StreamingText,
  render: (args) => <StreamingText {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/StreamingText",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { segments: [{ text: "Inspect the workspace" }], count: 3, streaming: false },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("StreamingText")).toHaveTextContent("Inspect the workspace");
  },
};
export const Partial: Story = {
  ...Default,
  args: { ...Default.args, count: 1, streaming: true },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("StreamingText")).toHaveTextContent("Inspect");
    await expect(canvas.getByTestId("StreamingText")).not.toHaveTextContent("workspace");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

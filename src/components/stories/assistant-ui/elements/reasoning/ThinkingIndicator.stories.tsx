import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ThinkingIndicator } from "../../../../assistant-ui/elements/ThinkingIndicator.js";
const meta: Meta<typeof ThinkingIndicator> = {
  component: ThinkingIndicator,
  render: (args) => <ThinkingIndicator {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/reasoning/ThinkingIndicator",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { label: "Reviewing source", elapsed: "2 seconds" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Reviewing source")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("2 seconds")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

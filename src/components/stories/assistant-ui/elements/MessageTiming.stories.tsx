import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { MessageTiming } from "../../../assistant-ui/elements/MessageTiming.js";
const meta: Meta<typeof MessageTiming> = {
  component: MessageTiming,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/MessageTiming",
  args: {
    stats: [
      { label: "First token", value: "240ms" },
      { label: "Speed", value: "42 tokens/s" },
    ],
    streaming: true,
  },
  render: (args) => <MessageTiming {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Streaming: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getAllByRole("term")).toHaveLength(2);
    await waitFor(() => expect(canvas.getByText("240ms")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("42 tokens/s")).toBeVisible());
  },
};
export const Completed: Story = { ...Streaming, args: { streaming: false }, play: Streaming.play };
export const NoStats: Story = {
  args: { stats: [] },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.queryByRole("term")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Streaming, globals: { theme: "light" }, play: Streaming.play };
export const DarkTheme: Story = { ...Streaming, globals: { theme: "dark" }, play: Streaming.play };

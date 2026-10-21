import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { EmptyStateGreeting } from "../../../../assistant-ui/elements/EmptyStateGreeting.js";
const meta: Meta<typeof EmptyStateGreeting> = {
  component: EmptyStateGreeting,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/EmptyStateGreeting",
  args: { children: "How can I help?" },
  render: (args) => <EmptyStateGreeting {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("heading", { name: "How can I help?" })).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

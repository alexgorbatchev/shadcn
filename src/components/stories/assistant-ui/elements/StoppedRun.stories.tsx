import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, fn } from "storybook/test";
import { StoppedRun } from "../../../assistant-ui/elements/StoppedRun.js";
const meta: Meta<typeof StoppedRun> = {
  component: StoppedRun,
  render: (args) => <StoppedRun {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/StoppedRun",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { words: ["Inspecting", "the", "workspace"], reason: "Stopped by user", onContinue: fn(), onDiscard: fn() },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Stopped by user")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

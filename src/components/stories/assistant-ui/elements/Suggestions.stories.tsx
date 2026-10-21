import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn } from "storybook/test";
import { Suggestions } from "../../../assistant-ui/elements/Suggestions.js";
const meta: Meta<typeof Suggestions> = {
  component: Suggestions,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Suggestions",
  render: (args) => <Suggestions {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { suggestions: ["Review the source", "Run the tests"], selectedSuggestion: null, cycle: 0, onSuggestion: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Run the tests" }));
    await expect(args.onSuggestion).toHaveBeenCalledWith("Run the tests");
  },
};
export const List: Story = {
  ...Default,
  args: { ...Default.args, variant: "list" },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Review the source" }));
    await expect(args.onSuggestion).toHaveBeenCalledWith("Review the source");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

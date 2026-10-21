import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { EmptyStateSuggestion } from "../../../../assistant-ui/elements/EmptyStateSuggestion.js";
import { EmptyStateSuggestions } from "../../../../assistant-ui/elements/EmptyStateSuggestions.js";
const meta: Meta<typeof EmptyStateSuggestion> = {
  component: EmptyStateSuggestion,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/EmptyStateSuggestion",
  args: { children: "Review files", onClick: fn() },
  render: (args) => (
    <EmptyStateSuggestions>
      <EmptyStateSuggestion {...args} />
    </EmptyStateSuggestions>
  ),
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Review files" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const ReducedMotion: Story = {
  args: { index: 3 },
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Review files" });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await waitFor(() => expect(canvas.getByTestId("EmptyStateSuggestion").getAnimations()).toHaveLength(0));
    }
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

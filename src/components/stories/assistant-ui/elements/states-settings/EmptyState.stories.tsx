import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { EmptyState } from "../../../../assistant-ui/elements/EmptyState.js";
import { EmptyStateGreeting } from "../../../../assistant-ui/elements/EmptyStateGreeting.js";
import { EmptyStateSuggestion } from "../../../../assistant-ui/elements/EmptyStateSuggestion.js";
import { EmptyStateSuggestions } from "../../../../assistant-ui/elements/EmptyStateSuggestions.js";
const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/EmptyState",
  args: {
    children: (
      <>
        <EmptyStateGreeting>What would you like to inspect?</EmptyStateGreeting>
        <EmptyStateSuggestions>
          <EmptyStateSuggestion>Review the workspace</EmptyStateSuggestion>
          <EmptyStateSuggestion index={1}>Explain the changes</EmptyStateSuggestion>
        </EmptyStateSuggestions>
      </>
    ),
  },
  render: (args) => <EmptyState {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Suggestions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("heading", { name: "What would you like to inspect?" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Review the workspace" }));
    const button = canvas.getByRole("button", { name: "Review the workspace" });
    await expect((button.getRootNode() as ShadowRoot).activeElement).toBe(button);
  },
};
export const LightTheme: Story = { ...Suggestions, globals: { theme: "light" }, play: Suggestions.play };
export const DarkTheme: Story = { ...Suggestions, globals: { theme: "dark" }, play: Suggestions.play };

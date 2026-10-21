import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { EmptyStateSuggestions } from "../../../assistant-ui/elements/EmptyStateSuggestions.js";
import { EmptyStateSuggestion } from "../../../assistant-ui/elements/EmptyStateSuggestion.js";
const meta: Meta<typeof EmptyStateSuggestions> = {
  component: EmptyStateSuggestions,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/EmptyStateSuggestions",
  args: {
    children: (
      <>
        <EmptyStateSuggestion>Review files</EmptyStateSuggestion>
        <EmptyStateSuggestion index={1}>Explain changes</EmptyStateSuggestion>
      </>
    ),
  },
  render: (args) => <EmptyStateSuggestions {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Explain changes" })).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, fn } from "storybook/test";
import { SharedConversation } from "../../../../assistant-ui/elements/SharedConversation.js";
const meta: Meta<typeof SharedConversation> = {
  component: SharedConversation,
  render: (args) => <SharedConversation {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/SharedConversation",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    title: "Workspace review",
    sharedBy: "Alex",
    sharedAt: "Today",
    turns: [
      { id: "user-turn", role: "user", text: "Inspect the source" },
      { id: "assistant-turn", role: "assistant", text: "The source is ready." },
    ],
    onContinue: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Workspace review")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("The source is ready.")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { AgentCard } from "../../../../assistant-ui/elements/AgentCard.js";
const meta: Meta<typeof AgentCard> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/agents-tasks/AgentCard",
  component: AgentCard,
  tags: ["autodocs", "test"],
  args: {
    name: "Code reviewer",
    description: "Reviews changes for accessibility.",
    provider: "Local agent",
    version: "1.0",
    model: "Reviewer",
    endpoint: "/agents/reviewer",
    skills: [{ name: "Review", description: "Inspect a change" }],
    connected: false,
    onConnect: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Code reviewer" })).toHaveAccessibleDescription(
      "Reviews changes for accessibility.",
    );
    await waitFor(() => expect(canvas.getByText("Inspect a change")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Connect" }));
    await expect(args.onConnect).toHaveBeenCalledTimes(1);
  },
};
export const Connected: Story = {
  args: { connected: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Connected" });
    await expect(button).toBeDisabled();
    button.focus();
    await expect(button).not.toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onConnect).not.toHaveBeenCalled();
  },
};
export const Unavailable: Story = {
  args: { onConnect: undefined, skills: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Connect" })).toBeDisabled();
    await expect(canvas.queryByText("Inspect a change")).not.toBeInTheDocument();
  },
};

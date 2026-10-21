import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { ConversationMapAui } from "../../../../assistant-ui/native/ConversationMapAui.js";
import { ConversationMapFixture } from "../fixtures/conversationMap.js";

const meta: Meta<typeof ConversationMapAui> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/ConversationMapAui",
  component: ConversationMapAui,
  tags: ["test"],
  render: (args) => <ConversationMapFixture {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollConversation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const navigation = await canvas.findByRole("navigation", { name: "Conversation map" });
    const first = within(navigation).getByRole("button", { name: "Question 1" });
    const last = within(navigation).getByRole("button", { name: "Question 8" });
    const viewport = canvas.getByRole("region", { name: "Conversation messages" });
    await waitFor(() => expect(first).toHaveAttribute("aria-current", "true"));
    const documentScroll = canvasElement.ownerDocument.documentElement.scrollTop;
    await userEvent.click(last);
    await waitFor(() => expect(last).toHaveAttribute("aria-current", "true"));
    await expect(viewport.scrollTop).toBeGreaterThan(0);
    await expect(canvasElement.ownerDocument.documentElement.scrollTop).toBe(documentScroll);
    await userEvent.keyboard("{Home}{Enter}");
    await waitFor(() => expect(first).toHaveAttribute("aria-current", "true"));
    await expect(first).toHaveFocus();
  },
};

export const RightSide: Story = { ...ScrollConversation, args: { side: "right" } };

export const Empty: Story = {
  render: () => <ConversationMapFixture isEmpty />,
  play: async ({ canvasElement }) => {
    const navigation = await within(canvasElement).findByRole("navigation", { name: "Conversation map" });
    await expect(within(navigation).queryByRole("button")).not.toBeInTheDocument();
  },
};

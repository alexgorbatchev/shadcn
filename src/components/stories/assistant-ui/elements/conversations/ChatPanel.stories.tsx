import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  ChatPanel,
  ChatPanelAssistantMessage,
  ChatPanelComposer,
  ChatPanelMessages,
  ChatPanelTyping,
  ChatPanelUserMessage,
} from "../../../../assistant-ui/elements/ChatPanel.js";
const meta: Meta<typeof ChatPanelComposer> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/ChatPanel",
  component: ChatPanelComposer,
  tags: ["autodocs", "test"],
  args: { placeholder: "Ask about the service", onSend: fn() },
  render: function Conversation(args) {
    const [value, setValue] = useState("");
    const [submitted, setSubmitted] = useState("");
    return (
      <ChatPanel>
        <ChatPanelMessages>
          <ChatPanelUserMessage>Inspect the service</ChatPanelUserMessage>
          <ChatPanelAssistantMessage>The service is healthy.</ChatPanelAssistantMessage>
          {submitted ? <ChatPanelUserMessage>{submitted}</ChatPanelUserMessage> : null}
        </ChatPanelMessages>
        <ChatPanelComposer
          {...args}
          value={value}
          onValueChange={setValue}
          onSend={() => {
            args.onSend?.();
            setSubmitted(value);
            setValue("");
          }}
        />
      </ChatPanel>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Submit: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Message" });
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
    await userEvent.type(input, "Show recent logs{Enter}");
    await expect(args.onSend).toHaveBeenCalledTimes(1);
    await expect(input).toHaveValue("");
    await waitFor(() => expect(canvas.getByText("Show recent logs")).toBeVisible());
  },
};
export const Typing: Story = {
  render: () => (
    <ChatPanel>
      <ChatPanelMessages>
        <ChatPanelUserMessage>Hello</ChatPanelUserMessage>
        <ChatPanelTyping />
      </ChatPanelMessages>
    </ChatPanel>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Assistant is typing");
  },
};
export const Unavailable: Story = {
  render: (args) => <ChatPanelComposer {...args} value="Ready to send" onSend={undefined} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveAttribute("readonly");
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
  },
};

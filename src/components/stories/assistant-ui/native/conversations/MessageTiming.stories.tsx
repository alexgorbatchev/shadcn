import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { MessageTiming } from "../../../../assistant-ui/native/MessageTiming.js";
import { MessageMetadataFixture } from "../fixtures/metadata.js";

const meta: Meta<typeof MessageTiming> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/MessageTiming",
  component: MessageTiming,
  tags: ["autodocs", "test"],
  render: (args) => (
    <MessageMetadataFixture
      messages={[
        {
          role: "assistant",
          content: "Complete",
          metadata: {
            timing: {
              streamStartTime: 0,
              firstTokenTime: 125,
              totalStreamTime: 1250,
              tokensPerSecond: 20,
              totalChunks: 25,
              toolCallCount: 0,
            },
          },
        },
      ]}
    >
      <MessageTiming {...args} />
    </MessageMetadataFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardDetails: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Message timing" });
    await expect(trigger).toHaveTextContent("1.25s");
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const details = await canvas.findByRole("dialog", { name: "Message timing" });
    await expect(details).toHaveTextContent("125ms");
    await expect(details).toHaveTextContent("20.0 tok/s");
    await expect(details).toHaveTextContent("25");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Streaming: Story = {
  render: () => (
    <MessageMetadataFixture
      messages={[
        {
          role: "assistant",
          content: "Still working",
          metadata: { timing: { streamStartTime: 0, totalChunks: 2, toolCallCount: 0 } },
        },
      ]}
    >
      <MessageTiming />
    </MessageMetadataFixture>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Still working")).toBeVisible();
    await expect(within(canvasElement).queryByRole("button", { name: "Message timing" })).not.toBeInTheDocument();
  },
};
export const Minimal: Story = {
  render: () => (
    <MessageMetadataFixture
      messages={[
        {
          role: "assistant",
          content: "Complete",
          metadata: { timing: { streamStartTime: 0, totalStreamTime: 50, totalChunks: 1, toolCallCount: 0 } },
        },
      ]}
    >
      <MessageTiming />
    </MessageMetadataFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Message timing" }));
    const details = await canvas.findByRole("dialog", { name: "Message timing" });
    await expect(details).toHaveTextContent("50ms");
    await expect(within(details).queryByText("First token")).not.toBeInTheDocument();
    await expect(within(details).queryByText("Speed")).not.toBeInTheDocument();
  },
};

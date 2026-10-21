import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { spyOn } from "storybook/test";
import { Thread } from "../../../../assistant-ui/native/Thread.js";
import { NativeRuntimeFixture } from "../helpers.js";
import {
  fixture_errorChatModelAdapter,
  fixture_pendingChatModelAdapter,
  fixture_toolCallMessages,
} from "../fixtures.js";
import {
  fixture_groupedMessage,
  fixture_inlineMedia,
  fixture_voiceExchange,
  ThreadReasoningFixture,
  ThreadToolsFixture,
  ThreadConsumerControlsFixture,
} from "../fixtures/thread.js";

const meta: Meta<typeof Thread> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/Thread",
  component: Thread,
  tags: ["test"],
  render: (args) => (
    <NativeRuntimeFixture>
      <Thread {...args} />
    </NativeRuntimeFixture>
  ),
  args: { autoFocus: false },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ConsumerControls: Story = {
  render: () => (
    <NativeRuntimeFixture>
      <ThreadConsumerControlsFixture />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Focus composer" }));
    await expect(canvas.getByRole("textbox", { name: "Message input" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Focus transcript" }));
    await expect(canvas.getByRole("region", { name: "Conversation" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Add context" }));
    await expect(canvas.getByRole("button", { name: "Context added" })).toBeVisible();
    await userEvent.type(canvas.getByRole("textbox", { name: "Message input" }), "Inspect this context");
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await userEvent.click(await canvas.findByText("Expand user text"));
    await expect(canvas.getByText("Inspect this context")).toBeVisible();
  },
};

export const BottomComposer: Story = {
  args: { emptyComposerPosition: "bottom" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const fixture = canvas.getByTestId("NativeRuntimeFixture");
    const input = await canvas.findByRole("textbox", { name: "Message input" });
    const send = canvas.getByRole("button", { name: "Send Message" });
    expect(fixture.getBoundingClientRect().bottom - send.getBoundingClientRect().bottom).toBeLessThan(60);
    await userEvent.type(input, "Keep the composer docked");
    expect(fixture.getBoundingClientRect().bottom - send.getBoundingClientRect().bottom).toBeLessThan(60);
  },
};

export const SpokenExchange: Story = {
  render: (args) => (
    <NativeRuntimeFixture initialMessages={fixture_voiceExchange}>
      <Thread {...args} />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Voice conversation")).toHaveLength(2);
    await expect(canvas.getAllByText("You said")).toHaveLength(2);
    await expect(canvas.getAllByText("Assistant said")).toHaveLength(3);
    const message = canvas.getByText("Spoken summary complete.");
    await userEvent.hover(message);
    const container = message.closest('[data-slot="aui_spoken-message-root"]');
    expect(container).not.toBeNull();
    const write = spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    try {
      await userEvent.click(within(container as HTMLElement).getByRole("button", { name: "Copy" }));
      await waitFor(() => expect(write).toHaveBeenCalledWith("Spoken summary complete."));
    } finally {
      write.mockRestore();
    }
  },
};

export const InlineFilesAndImages: Story = {
  render: (args) => (
    <NativeRuntimeFixture initialMessages={fixture_inlineMedia}>
      <Thread {...args} />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("user-notes.txt")).toBeInTheDocument();
    await expect(canvas.getByText("assistant-notes.txt")).toBeInTheDocument();
    await expect(canvas.getAllByRole("img")).toHaveLength(4);
    await userEvent.click(canvas.getByRole("img", { name: "user-file.svg" }));
    await waitFor(() => expect(within(document.body).getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const CustomPartGroups: Story = {
  render: (args) => (
    <NativeRuntimeFixture initialMessages={fixture_groupedMessage}>
      <Thread {...args} components={{ ReasoningGroup: ThreadReasoningFixture, ToolGroup: ThreadToolsFixture }} />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByText("Review reasoning (1)"));
    await waitFor(() => expect(canvas.getByText("Review native service metadata.")).toBeVisible());
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByText("Review tools (1)"));
    await userEvent.click(canvas.getByRole("button", { name: "Used tool: inspect_service" }));
    await waitFor(() => expect(canvas.getByText("Result:")).toBeVisible());
  },
};

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("How can I help you today?")).toBeVisible());
    await expect(canvas.getByRole("textbox", { name: "Message input" })).toHaveValue("");
    await expect(canvas.getByRole("button", { name: "Send Message" })).toBeDisabled();
  },
};

export const ShortConversationViewport: Story = {
  render: (args) => (
    <NativeRuntimeFixture>
      <div data-testid="ShortConversationViewport" style={{ height: 140, width: 300, flexShrink: 0 }}>
        <Thread {...args} />
      </div>
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByTestId("ShortConversationViewport");
    const input = await canvas.findByRole("textbox", { name: "Message input" });
    const send = canvas.getByRole("button", { name: "Send Message" });
    await waitFor(() => {
      expect(input.getBoundingClientRect().top).toBeGreaterThanOrEqual(viewport.getBoundingClientRect().top);
      expect(send.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewport.getBoundingClientRect().bottom);
    });
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "A small chat panel.");
    }
    await userEvent.click(send);
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
  },
};

export const SendAndRegenerate: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole("textbox", { name: "Message input" });
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Explain the stack.");
    }
    await expect(input).toHaveValue("Explain the stack.");
    await expect(canvas.getByRole("button", { name: "Send Message" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await expect(canvas.getByText("Explain the stack.")).toBeVisible();
    await expect(input).toHaveValue("");
    await userEvent.click(canvas.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Previous" })).toBeEnabled());
    await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Next" })).toBeEnabled();
  },
};

export const EditMessage: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("textbox", { name: "Message input" })).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Original request");
    }
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole("button", { name: "Send Message" }),
    );
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await userEvent.hover(
      await within(canvasElement.ownerDocument.body).findByText("Original request", { exact: true }),
    );
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("button", { name: "Edit" }));
    const editor = await canvas.findByRole("textbox", { name: "Edit message" });
    await waitFor(() => expect(editor).toHaveValue("Original request"));
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Edit message" });
      await userEvent.clear(input);
      await userEvent.type(input, "Updated request");
    }
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("button", { name: "Update" }));
    await waitFor(() => expect(canvas.getByText("Updated request")).toBeVisible());
    await waitFor(() => expect(canvas.queryByText("Original request")).not.toBeInTheDocument());
    await expect(canvas.getByRole("textbox", { name: "Message input" })).toBeVisible();
  },
};

export const CancelGeneration: Story = {
  render: (args) => (
    <NativeRuntimeFixture adapter={fixture_pendingChatModelAdapter}>
      <Thread {...args} />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("textbox", { name: "Message input" })).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Inspect the project.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Working on the request.")).toBeVisible());
    await userEvent.click(await canvas.findByRole("button", { name: "Stop Generating" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Stop Generating" })).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Send Message" })).toBeDisabled();
    await expect(canvas.getByText("Working on the request.")).toBeVisible();
  },
};

export const Error: Story = {
  render: (args) => (
    <NativeRuntimeFixture adapter={fixture_errorChatModelAdapter}>
      <Thread {...args} />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("textbox", { name: "Message input" })).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Inspect the project.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("The harness could not complete this request.");
    await expect(canvas.getByRole("button", { name: "Refresh" })).toBeEnabled();
  },
};

export const ToolResult: Story = {
  render: (args) => (
    <NativeRuntimeFixture initialMessages={fixture_toolCallMessages}>
      <Thread {...args} />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "1 tool call" }));
    const trigger = await canvas.findByRole("button", { name: "Used tool: inspect_service" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(canvas.getByText('{"service":"docs"}')).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Result:")).toBeVisible());
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

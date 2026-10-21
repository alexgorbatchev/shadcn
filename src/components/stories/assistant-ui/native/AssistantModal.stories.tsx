import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { AssistantModal } from "../../../assistant-ui/native/AssistantModal.js";
import { NativeRuntimeFixture } from "./helpers.js";

const meta: Meta<typeof AssistantModal> = {
  title: "shadcn-alexgorbatchev/assistant-ui/native/AssistantModal",
  component: AssistantModal,
  tags: ["test"],
  render: () => (
    <NativeRuntimeFixture>
      <AssistantModal />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const OpenAndDismiss: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", { name: "Open Assistant" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog", { name: "New Chat" });
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Message input" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const SendAndNewThread: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Open Assistant" }));
    const dialog = await canvas.findByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Review the project.");
    }
    await userEvent.click(within(dialog).getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(within(dialog).getByText("Ready to help.")).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "New Thread" }));
    await waitFor(() => expect(within(dialog).getByText("How can I help you today?")).toBeVisible());
    await expect(within(dialog).getByRole("textbox", { name: "Message input" })).toHaveValue("");
  },
};

export const BrowseSearchAndReturnToThread: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Open Assistant" }));
    const dialog = await canvas.findByRole("dialog");
    await expect(within(dialog).getByRole("button", { name: "Threads" })).toBeDisabled();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Keep this conversation.");
    }
    await userEvent.click(within(dialog).getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(within(dialog).getByText("Ready to help.")).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Threads" }));
    await expect(within(dialog).getByRole("heading", { name: "Threads" })).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("searchbox", { name: "Search threads" });
      await userEvent.clear(input);
      await userEvent.type(input, "missing conversation");
    }
    await expect(within(dialog).getByText("No threads found")).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("searchbox", { name: "Search threads" });
      await userEvent.clear(input);
    }
    await userEvent.click(within(dialog).getByRole("button", { name: "New Chat" }));
    await waitFor(() => expect(within(dialog).getByText("Keep this conversation.")).toBeVisible());
    await expect(within(dialog).queryByRole("searchbox")).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Threads" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Threads" }));
    await expect(within(dialog).getByRole("textbox", { name: "Message input" })).toBeVisible();
  },
};

export const ReopenReturnsToConversation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Open Assistant" }));
    const dialog = await canvas.findByRole("dialog");
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Retain my conversation.");
    }
    await userEvent.click(within(dialog).getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(within(dialog).getByText("Ready to help.")).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Threads" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Open Assistant" }));
    const reopened = await canvas.findByRole("dialog", { name: "New Chat" });
    await waitFor(() => expect(within(reopened).getByText("Retain my conversation.")).toBeVisible());
    await expect(within(reopened).queryByRole("searchbox")).not.toBeInTheDocument();
  },
};

export const ResizeAndReset: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Open Assistant" }));
    const dialog = await canvas.findByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());
    const handle = within(dialog).getByRole("button", { name: "Resize Assistant" });
    await userEvent.dblClick(handle);
    const width = dialog.getBoundingClientRect().width;
    await userEvent.click(handle);
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(dialog.getBoundingClientRect().width).toBeGreaterThan(width));
    await userEvent.dblClick(handle);
    await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(width));
  },
};

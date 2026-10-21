import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, waitFor, within } from "storybook/test";

import { ThreadList } from "../../../../assistant-ui/native/ThreadList.js";
import { Thread } from "../../../../assistant-ui/native/Thread.js";
import { NativeRuntimeFixture } from "../helpers.js";

const meta: Meta<typeof ThreadList> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/ThreadList",
  component: ThreadList,
  tags: ["test"],
  beforeEach: () => {
    const errors = spyOn(console, "error");
    return () => errors.mockRestore();
  },
  afterEach: async () => {
    await expect(console.error).not.toHaveBeenCalled();
  },
  render: () => (
    <NativeRuntimeFixture>
      <ThreadList />
      <Thread autoFocus={false} />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const NewConversation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "New Thread" })).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Inspect this page.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "New Thread" }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Message input" })).toHaveValue(""));
    await waitFor(() => expect(canvas.getByText("How can I help you today?")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "New Chat" })).toBeVisible();
  },
};

export const RenameAndSearch: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("textbox", { name: "Message input" })).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Inspect this page.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Rename" }));
    await expect(await canvas.findByRole("textbox", { name: "Rename thread" })).toHaveFocus();
    await expect(canvas.queryByRole("menuitem", { name: "Rename" })).not.toBeInTheDocument();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Rename thread" });
      await userEvent.clear(input);
      await userEvent.type(input, "Page review");
    }
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Page review" })).toHaveFocus());
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("searchbox", { name: "Search threads" });
      await userEvent.clear(input);
      await userEvent.type(input, "different topic");
    }
    await expect(canvas.getByText("No threads found")).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("searchbox", { name: "Search threads" });
      await userEvent.clear(input);
      await userEvent.type(input, "PAGE");
    }
    await expect(canvas.getByRole("button", { name: "Page review" })).toBeVisible();
  },
};

export const Archive: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("textbox", { name: "Message input" })).toBeVisible();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Archive this conversation.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Archive" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "More options" })).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "New Thread" })).toBeVisible();
  },
};

export const CancelRename: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Keep the original title.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Rename" }));
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Rename thread" });
      await userEvent.clear(input);
      await userEvent.type(input, "Discard this title");
    }
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "New Chat" })).toHaveFocus());
    await expect(canvas.queryByRole("button", { name: "Discard this title" })).not.toBeInTheDocument();
  },
};

export const RenameOnBlurAndIgnoreEmptyTitle: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Rename using blur.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Rename" }));
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Rename thread" });
      await userEvent.clear(input);
      await userEvent.type(input, "  Working title  ");
    }
    await userEvent.click(canvas.getByRole("searchbox", { name: "Search threads" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Working title" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Rename" }));
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Rename thread" });
      await userEvent.clear(input);
      await userEvent.type(input, "   ");
    }
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Working title" })).toHaveFocus());
  },
};

export const DeleteConversation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Delete this conversation.");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(canvas.getByText("Ready to help.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Delete" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "More options" })).not.toBeInTheDocument());
    await expect(canvas.queryByText("Delete this conversation.")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText("How can I help you today?")).toBeVisible());
  },
};

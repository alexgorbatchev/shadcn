import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { expect, waitFor, within } from "storybook/test";
import { SelectionToolbar } from "../../../../assistant-ui/native/SelectionToolbar.js";
import { ComposerQuotePreview } from "../../../../assistant-ui/native/ComposerQuotePreview.js";
import { NativeRuntimeFixture } from "../helpers.js";

function SelectableMessage(): ReactElement {
  return (
    <MessagePrimitive.Root>
      <MessagePrimitive.Parts />
    </MessagePrimitive.Root>
  );
}

function SelectionFixture(): ReactElement {
  return (
    <>
      <p>Outside the conversation</p>
      <NativeRuntimeFixture
        initialMessages={[
          { role: "assistant", content: "Select this answer to quote it." },
          { role: "assistant", content: "A separate answer." },
        ]}
      >
        <ThreadPrimitive.Root>
          <ThreadPrimitive.Messages
            components={{ UserMessage: SelectableMessage, AssistantMessage: SelectableMessage }}
          />
          <SelectionToolbar />
          <ComposerPrimitive.Root>
            <ComposerQuotePreview />
            <ComposerPrimitive.Input aria-label="Message" />
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </NativeRuntimeFixture>
    </>
  );
}

function select(element: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  if (!selection) throw new Error("Browser selection unavailable");
  selection.removeAllRanges();
  selection.addRange(range);
}

const meta: Meta<typeof SelectionToolbar> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/SelectionToolbar",
  component: SelectionToolbar,
  tags: ["autodocs", "test"],
  render: () => <SelectionFixture />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const QuoteSelection: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    select(canvas.getByText("Select this answer to quote it."));
    await userEvent.click(await within(document.body).findByRole("button", { name: "Quote" }));
    const preview = await canvas.findByTestId("ComposerQuotePreviewText");
    await expect(preview).toHaveTextContent("Select this answer to quote it.");
    await expect(window.getSelection()?.toString()).toBe("");
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss quote" }));
    await waitFor(() => expect(canvas.queryByTestId("ComposerQuotePreviewText")).not.toBeInTheDocument());
  },
};
export const OutsideSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    select(canvas.getByText("Select this answer to quote it."));
    await within(document.body).findByRole("button", { name: "Quote" });
    select(canvas.getByText("Outside the conversation"));
    await waitFor(() => expect(within(document.body).queryByRole("button", { name: "Quote" })).not.toBeInTheDocument());
    window.getSelection()?.removeAllRanges();
  },
};
export const CrossMessageSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByText("Select this answer to quote it.");
    const second = canvas.getByText("A separate answer.");
    select(first);
    await within(document.body).findByRole("button", { name: "Quote" });
    const range = document.createRange();
    range.setStartBefore(first);
    range.setEndAfter(second);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    await waitFor(() => expect(within(document.body).queryByRole("button", { name: "Quote" })).not.toBeInTheDocument());
    selection?.removeAllRanges();
  },
};

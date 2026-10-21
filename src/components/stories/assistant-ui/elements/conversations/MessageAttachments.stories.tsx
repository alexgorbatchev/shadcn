import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import image from "../fixtures/sample.svg?url";
import { MessageAttachments } from "../../../../assistant-ui/elements/MessageAttachments.js";
const meta: Meta<typeof MessageAttachments> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/MessageAttachments",
  component: MessageAttachments,
  tags: ["autodocs", "test"],
  args: {
    attachments: [
      { id: "image", name: "Preview", size: "1 KB", kind: "image", image },
      { id: "document", name: "Report.pdf", size: "12 KB", kind: "document", pages: 3 },
      { id: "file", name: "Archive.zip", size: "4 KB", kind: "file" },
    ],
    onOpen: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Open: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Report.pdf/ }));
    await expect(args.onOpen).toHaveBeenCalledWith("document");
    await userEvent.click(canvas.getByRole("button", { name: /Preview/ }));
    await expect(args.onOpen).toHaveBeenLastCalledWith("image");
    await expect(canvas.getByText("12 KB · 3 pages")).toBeVisible();
  },
};
export const ReadOnly: Story = {
  args: { onOpen: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText("Archive.zip")).toBeVisible());
  },
};
export const Empty: Story = {
  args: { attachments: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};

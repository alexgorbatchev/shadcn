import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { UserMessageAttachments } from "../../../../assistant-ui/native/AttachmentPreview.js";
import { ComposerAttachmentFixture, MessageAttachmentFixture } from "../fixtures/attachments.js";

const meta: Meta<typeof UserMessageAttachments> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/composer/AttachmentPreview",
  component: UserMessageAttachments,
  tags: ["test"],
  render: () => <MessageAttachmentFixture />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ImagePreview: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", { name: "Preview diagram.svg" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog", { name: "Preview diagram.svg" });
    await waitFor(() => expect(within(dialog).getByRole("img", { name: "Preview of diagram.svg" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: "Remove diagram.svg" })).not.toBeInTheDocument();
  },
};

export const Document: Story = {
  render: () => <MessageAttachmentFixture isImage={false} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Document attachment guide.txt" }));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Remove guide.txt" })).not.toBeInTheDocument();
  },
};

export const ComposerRemove: Story = {
  render: () => <ComposerAttachmentFixture />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Add Attachment" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Attach diagram" }));
    await expect(await canvas.findByRole("button", { name: "Preview diagram.svg" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove diagram.svg" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Preview diagram.svg" })).not.toBeInTheDocument());
  },
};

export const UploadError: Story = {
  render: () => <ComposerAttachmentFixture hasError />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Attach diagram" }));
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("The image could not be attached.");
    await expect(alert).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove diagram.svg" }));
    await waitFor(() => expect(canvas.queryByRole("alert")).not.toBeInTheDocument());
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerAttachmentChip } from "../../../../assistant-ui/elements/ComposerAttachmentChip.js";
import { fixture_composerAttachment } from "../fixtures.js";
const meta: Meta<typeof ComposerAttachmentChip> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/ComposerAttachmentChip",
  component: ComposerAttachmentChip,
  tags: ["autodocs", "test"],
  args: { attachment: fixture_composerAttachment, onRemove: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Ready: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("TypeScript source")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove Layout.tsx" }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(args.onRemove).toHaveBeenCalledWith("Layout.tsx");
  },
};
export const Uploading: Story = {
  args: { attachment: { ...fixture_composerAttachment, state: "uploading", progress: 45 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar", { name: "Uploading Layout.tsx" })).toHaveValue(45);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Failed: Story = {
  args: { attachment: { ...fixture_composerAttachment, state: "error", meta: "Upload failed" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Layout.tsxUpload failed");
    await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  args: { onRemove: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Layout.tsx")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

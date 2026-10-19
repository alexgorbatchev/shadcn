import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { Button } from "../Button";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "shadcn-alexgorbatchev/components/ConfirmationDialog",
  component: ConfirmationDialog,
  tags: ["autodocs", "test"],
  args: {
    title: "Remove image?",
    description: "The current image will be removed.",
    confirmLabel: "Remove image",
    onConfirm: fn(),
    open: false,
    onOpenChange: fn(),
  },
  render: function Example(args): ReactElement {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Remove</Button>
        <ConfirmationDialog {...args} open={open} onOpenChange={setOpen} />
      </>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Confirm: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
    const dialog = await body.findByRole("alertdialog", { name: "Remove image?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove image" }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const Cancel: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const Failed: Story = {
  args: {
    onConfirm: async () => {
      throw new Error("Could not remove image");
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove image" }));
    await expect(await within(dialog).findByRole("alert")).toHaveTextContent("Could not remove image");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  },
};

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, mocked, within, waitFor } from "storybook/test";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { Button } from "../../Button";
import { fixture_confirmation } from "./fixtures";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "@alexgorbatchev/shadcn/components/overlays/ConfirmationDialog",
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
      throw new Error("Private removal diagnostic");
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove image" }));
    await expect(await within(dialog).findByRole("alert")).toHaveTextContent("The action could not be completed.");
    await expect(dialog).not.toHaveTextContent("Private removal diagnostic");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  },
};
export const AuthoredFailureAndRetry: Story = {
  args: {
    onConfirm: fn(),
    renderError: () => "The image is in use. Close the editor and retry.",
  },
  play: async ({ canvasElement, userEvent, args }) => {
    mocked(args.onConfirm).mockRejectedValueOnce(new Error("Private removal diagnostic")).mockResolvedValue(undefined);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove image" }));
    await expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "The image is in use. Close the editor and retry.",
    );
    await expect(dialog).not.toHaveTextContent("Private removal diagnostic");
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove image" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(args.onConfirm).toHaveBeenCalledTimes(2);
  },
};
export const LongDescription: Story = {
  args: { description: "Review this irreversible image removal carefully. ".repeat(300) },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
    const heading = within(dialog).getByRole("heading", { name: "Remove image?" });
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(cancel).toBeVisible());
    const viewport = dialog.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
    await expect(viewport).toBeInTheDocument();
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    const headerTop = heading.getBoundingClientRect().top;
    const footerTop = cancel.getBoundingClientRect().top;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "instant" });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    await expect(heading.getBoundingClientRect().top).toBe(headerTop);
    await expect(cancel.getBoundingClientRect().top).toBe(footerTop);
    await expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    await expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    await userEvent.click(cancel);
  },
};
export const Pending: Story = {
  beforeEach: () => {
    fixture_confirmation.pending = Promise.withResolvers<void>();
  },
  args: { onConfirm: fn(() => fixture_confirmation.pending.promise) },
  play: async ({ canvasElement, userEvent, args }) => {
    try {
      await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
      const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
      await userEvent.click(within(dialog).getByRole("button", { name: "Remove image" }));
      await expect(within(dialog).getByRole("button", { name: "Working…" })).toBeDisabled();
      await expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(dialog).toBeVisible());
      await expect(args.onConfirm).toHaveBeenCalledOnce();
      fixture_confirmation.pending.resolve();
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    } finally {
      fixture_confirmation.pending.resolve();
    }
  },
};

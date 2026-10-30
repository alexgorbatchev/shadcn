import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { FormDialog } from "../../FormDialog";
import { Input } from "../../Input";
import { Button } from "../../Button";
import { fixture_formDialogAction } from "./fixtures";

const meta: Meta<typeof FormDialog> = {
  title: "@alexgorbatchev/shadcn/components/overlays/FormDialog",
  component: FormDialog,
  tags: ["autodocs", "test"],
  args: {
    open: false,
    onOpenChange: fn(),
    title: "Edit project",
    description: "Change the project name.",
    submitLabel: "Save project",
    onSubmit: fn((event) => event.preventDefault()),
    children: <Input aria-label="Project name" defaultValue="Example" />,
  },
  render: function Example(args): ReactElement {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit project</Button>
        <FormDialog
          {...args}
          open={open}
          onOpenChange={(next) => {
            args.onOpenChange(next);
            setOpen(next);
          }}
        />
      </>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Submit: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit project" });
    await userEvent.click(within(dialog).getByRole("textbox", { name: "Project name" }));
    await userEvent.keyboard(" revised{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledOnce();
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
export const Busy: Story = {
  args: { isBusy: true },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit project" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
    await expect(within(dialog).getByRole("button", { name: "Save project" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    const backdrop = canvasElement.ownerDocument.querySelector('[data-slot="dialog-overlay"]') as HTMLElement;
    await expect(backdrop).toBeInTheDocument();
    await userEvent.click(backdrop);
    await expect(dialog).toBeVisible();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("textbox", { name: "Project name" }));
    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const ConsentOnly: Story = {
  args: {
    onSubmit: undefined,
    submitLabel: undefined,
    primaryAction: <Button onClick={fixture_formDialogAction}>Review changes</Button>,
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit project" });
    await expect(dialog.querySelector("form")).toBeNull();
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Review changes" }));
    await expect(fixture_formDialogAction).toHaveBeenCalledOnce();
    await expect(dialog).toBeVisible();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const DoneOnly: Story = {
  args: { onSubmit: undefined, submitLabel: undefined, cancelLabel: "Done" },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit project" });
    await expect(within(dialog).queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const LongContent: Story = {
  args: {
    children: Array.from({ length: 60 }, (_, index) => <p key={index}>Project detail {index + 1}</p>),
    error: "Save failed. Retry after checking the project.",
  },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit project" });
    const heading = within(dialog).getByRole("heading", { name: "Edit project" });
    const save = within(dialog).getByRole("button", { name: "Save project" });
    await waitFor(() => expect(save).toBeVisible());
    const viewport = dialog.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
    await expect(viewport).toBeInTheDocument();
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    const headerTop = heading.getBoundingClientRect().top;
    const footerTop = save.getBoundingClientRect().top;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "instant" });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    await expect(heading.getBoundingClientRect().top).toBe(headerTop);
    await expect(save.getBoundingClientRect().top).toBe(footerTop);
    await expect(within(viewport).getByRole("alert")).toBeVisible();
    await expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    await expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  },
};

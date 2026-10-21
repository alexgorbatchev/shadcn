import { useId, useRef, useState } from "react";
import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { expect, fn, waitFor, within } from "storybook/test";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from "../Dialog";
import { Button } from "../Button";
import { Field, FieldLabel, FieldGroup } from "../Field";
import { Input } from "../Input";
import { DensityProvider } from "../DensityProvider";
import { DirectionProvider } from "../DirectionProvider";

const meta: Meta<typeof Dialog> = {
  title: "shadcn-alexgorbatchev/components/Dialog",
  component: Dialog,
  tags: ["autodocs", "test"],
  args: { onOpenChange: fn(), onOpenChangeComplete: fn() },
  render: function Render(args) {
    const storyId = useId();
    return (
      <Dialog {...args}>
        <DialogTrigger render={<Button variant="outline" />}>Edit profile</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your display name.</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={storyId}>Name</FieldLabel>
            <Input id={storyId} defaultValue="Alex Gorbatchev" />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <DialogClose render={<Button />}>Save changes</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Fullscreen: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>Expand diagram</DialogTrigger>
      <DialogContent size="fullscreen">
        <DialogTitle>Diagram canvas</DialogTitle>
        <DialogDescription>Explore the diagram in the full viewport.</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Expand diagram" });
    await userEvent.click(trigger);
    const popup = await within(document.body).findByRole("dialog", { name: "Diagram canvas" });
    await waitFor(() => {
      const bounds = popup.getBoundingClientRect();
      expect(bounds.width).toBeCloseTo(window.innerWidth, 0);
      expect(bounds.height).toBeCloseTo(window.innerHeight, 0);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Edit profile" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit profile" });
    await expect(dialog).toHaveAccessibleDescription("Update your display name.");
    const input = within(dialog).getByRole("textbox", { name: "Name" });
    await waitFor(() => expect(input).toHaveFocus());
    await expect(getComputedStyle(dialog).animationName === "none").toBe(
      canvasElement.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const overlay = canvasElement.ownerDocument.querySelector("[data-slot=dialog-overlay]") as HTMLElement;
    await expect(getComputedStyle(overlay).animationName === "none").toBe(
      canvasElement.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    await userEvent.clear(input);
    await userEvent.type(input, "Blair");
    await expect(input).toHaveValue("Blair");
    await userEvent.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "close-press" }));
    await expect(args.onOpenChangeComplete).toHaveBeenLastCalledWith(false);
  },
};
export const WideForm: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>Edit metadata</DialogTrigger>
      <DialogContent size="wide">
        <DialogHeader>
          <DialogTitle>Metadata</DialogTitle>
          <DialogDescription>Two fields share a row.</DialogDescription>
        </DialogHeader>
        <FieldGroup columns={2}>
          <Field>
            <FieldLabel htmlFor="wide-title">Title</FieldLabel>
            <Input id="wide-title" />
          </Field>
          <Field>
            <FieldLabel htmlFor="wide-artist">Artist</FieldLabel>
            <Input id="wide-artist" />
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit metadata" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Metadata" });
    const title = within(dialog).getByLabelText("Title").getBoundingClientRect();
    const artist = within(dialog).getByLabelText("Artist").getBoundingClientRect();
    await expect(artist.left).toBeGreaterThan(title.right);
    await expect(artist.top).toBe(title.top);
    await expect(dialog.getBoundingClientRect().width).toBeGreaterThan(500);
    await userEvent.keyboard("{Escape}");
  },
};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  play: async ({ canvasElement, userEvent }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit profile" });
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Name" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const NonModal: Story = {
  args: { modal: false },
  render: (args) => (
    <>
      <Button>Outside action</Button>
      <Dialog {...args}>
        <DialogTrigger render={<Button />}>Open nonmodal</DialogTrigger>
        <DialogContent>
          <DialogTitle>Nonmodal profile</DialogTitle>
          <DialogDescription>Outside controls remain available.</DialogDescription>
          <Input aria-label="Name" />
        </DialogContent>
      </Dialog>
    </>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open nonmodal" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Nonmodal profile" });
    await userEvent.click(canvas.getByRole("button", { name: "Outside action" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Outside action" })).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "focus-out" }));
  },
};
export const KeyboardFocusTrap: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Edit profile" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit profile" });
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Name" })).toHaveFocus());
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Name" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const DisabledTrigger: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger disabled render={<Button />}>
        Unavailable editor
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Unavailable profile</DialogTitle>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Unavailable editor" });
    await expect(trigger).toBeDisabled();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await expect(trigger).not.toHaveFocus();
  },
};
export const CancelledOpening: Story = {
  args: { onOpenChange: fn((_open: boolean, details: DialogRootChangeEventDetails) => details.cancel()) },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit profile" }));
    await waitFor(() =>
      expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: "trigger-press" })),
    );
    await expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};
export const CancelledClosing: Story = {
  args: {
    onOpenChange: fn((open: boolean, details: DialogRootChangeEventDetails) => {
      if (!open) details.cancel();
    }),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit profile" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit profile" });
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Name" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "escape-key" }));
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "close-press" }));
  },
};
export const Controlled: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show controlled editor</Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Controlled profile</DialogTitle>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
        <output aria-label="Dialog state">{String(isOpen)}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status", { name: "Dialog state" });
    await userEvent.click(canvas.getByRole("button", { name: "Show controlled editor" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Controlled profile" });
    await expect(status).toHaveTextContent("true");
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(status).toHaveTextContent("false");
  },
};
export const OutsideDismissal: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>Open dismissible editor</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Dismissible profile</DialogTitle>
        <DialogClose render={<Button />}>Done</DialogClose>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open dismissible editor" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Dismissible profile" });
    await waitFor(() => expect(dialog).toBeVisible());
    const overlay = canvasElement.ownerDocument.querySelector("[data-slot=dialog-overlay]") as HTMLElement;
    await userEvent.click(overlay);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "outside-press" }),
    );
  },
};
export const PreventOutsideDismissal: Story = {
  args: { disablePointerDismissal: true },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit profile" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit profile" });
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Name" })).toHaveFocus());
    await userEvent.click(canvasElement.ownerDocument.querySelector("[data-slot=dialog-overlay]") as HTMLElement);
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "escape-key" }));
  },
};
export const NativeCallbacks: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger className={(state) => (state.open ? "w-64" : "w-48")}>Callback editor</DialogTrigger>
      <DialogContent className={(state) => (state.open ? "w-64" : "w-48")}>
        <DialogTitle className={() => "h-12"}>Callback profile</DialogTitle>
        <DialogDescription className={() => "h-10"}>Callback description</DialogDescription>
        <DialogClose className={(state) => (state.disabled ? "h-12" : "h-8")}>Done</DialogClose>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Callback editor" });
    await expect(trigger.getBoundingClientRect().width).toBe(192);
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Callback profile" });
    await waitFor(() => expect(trigger.getBoundingClientRect().width).toBe(256));
    await expect.soft(dialog.getBoundingClientRect().width).toBe(256);
    await expect
      .soft(within(dialog).getByRole("heading", { name: "Callback profile" }).getBoundingClientRect().height)
      .toBe(48);
    await expect.soft(within(dialog).getByText("Callback description").getBoundingClientRect().height).toBe(40);
    await expect.soft(within(dialog).getByRole("button", { name: "Done" }).getBoundingClientRect().height).toBe(32);
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const OverlayCallback: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>Open backdrop example</DialogTrigger>
      <DialogPortal>
        <DialogOverlay data-testid="Dialog--overlay" className={(state) => (state.open ? "opacity-50" : "opacity-0")} />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover p-panel">
          <DialogTitle>Backdrop example</DialogTitle>
          <DialogClose render={<Button />}>Done</DialogClose>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open backdrop example" }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Backdrop example" });
    await waitFor(() => expect(getComputedStyle(body.getByTestId("Dialog--overlay")).opacity).toBe("0.5"));
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const CompactPortal: Story = {
  render: (args) => (
    <DensityProvider density="compact">
      <Dialog {...args}>
        <DialogTrigger render={<Button />}>Open compact editor</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Compact profile</DialogTitle>
          <DialogDescription>Compact portal content.</DialogDescription>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </DensityProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open compact editor" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Compact profile" });
    await expect(dialog).toHaveAttribute("data-density", "compact");
    await expect(getComputedStyle(within(dialog).getByText("Compact portal content.")).fontSize).toBe("12px");
    await expect(within(dialog).getByRole("button", { name: "Close" }).getBoundingClientRect().height).toBe(20);
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const RTL: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <section dir="rtl">
        <Dialog {...args}>
          <DialogTrigger render={<Button />}>Open RTL editor</DialogTrigger>
          <DialogContent>
            <DialogTitle>RTL profile</DialogTitle>
            <DialogDescription>Direction follows the portal.</DialogDescription>
          </DialogContent>
        </Dialog>
      </section>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open RTL editor" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "RTL profile" });
    await expect.soft(getComputedStyle(dialog).direction).toBe("rtl");
    await expect
      .soft(within(dialog).getByRole("button", { name: "Close" }).getBoundingClientRect().left)
      .toBeLessThan(dialog.getBoundingClientRect().left + dialog.getBoundingClientRect().width / 2);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const CustomFocusAndNativeRender: Story = {
  render: function Render(args) {
    const inputRef = useRef<HTMLInputElement>(null);
    const finalRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <>
        <Button ref={finalRef}>Return target</Button>
        <Dialog {...args}>
          <DialogTrigger render={<button type="button" />}>Custom focus editor</DialogTrigger>
          <DialogContent render={<section />} ref={popupRef} initialFocus={inputRef} finalFocus={finalRef}>
            <DialogTitle>Custom focus profile</DialogTitle>
            <Input ref={inputRef} aria-label="Preferred field" />
            <DialogClose render={<Button />}>Done</DialogClose>
            <Button onClick={() => popupRef.current?.focus()}>Focus surface</Button>
          </DialogContent>
        </Dialog>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Custom focus editor" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", {
      name: "Custom focus profile",
    });
    await expect(dialog.tagName).toBe("SECTION");
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Preferred field" })).toHaveFocus());
    await userEvent.click(within(dialog).getByRole("button", { name: "Focus surface" }));
    await expect(dialog).toHaveFocus();
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole("button", { name: "Return target" })).toHaveFocus());
  },
};
export const FooterCloseOnly: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>Open footer example</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Footer example</DialogTitle>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open footer example" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Footer example" });
    await expect(within(dialog).getAllByRole("button", { name: "Close" })).toHaveLength(1);
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const Nested: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>Open parent</DialogTrigger>
      <DialogContent>
        <DialogTitle>Parent editor</DialogTitle>
        <Dialog>
          <DialogTrigger render={<Button />}>Open child</DialogTrigger>
          <DialogContent>
            <DialogTitle>Child editor</DialogTitle>
            <DialogClose render={<Button />}>Finish child</DialogClose>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open parent" }));
    const body = within(canvasElement.ownerDocument.body);
    const parent = await body.findByRole("dialog", { name: "Parent editor" });
    const trigger = within(parent).getByRole("button", { name: "Open child" });
    await userEvent.click(trigger);
    const child = await body.findByRole("dialog", { name: "Child editor" });
    await waitFor(() => expect(child.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(child).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(parent).not.toBeInTheDocument());
  },
};
export const Payload: Story = {
  render: () => (
    <Dialog<string>>
      {({ payload }) => (
        <>
          <DialogTrigger<string> payload="Alex">Edit Alex</DialogTrigger>
          <DialogTrigger<string> payload="Blair">Edit Blair</DialogTrigger>
          <DialogContent>
            <DialogTitle>Edit {payload}</DialogTitle>
            <DialogClose render={<Button />}>Done</DialogClose>
          </DialogContent>
        </>
      )}
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Edit Blair" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Edit Blair" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const FocusTrapWithoutScrollLock: Story = {
  render: function Render(args) {
    const [count, setCount] = useState(0);
    return (
      <>
        <Button onClick={() => setCount(count + 1)}>Outside counter</Button>
        <output aria-label="Outside count">{count}</output>
        <Dialog {...args} modal="trap-focus" disablePointerDismissal>
          <DialogTrigger render={<Button />}>Open focus trap</DialogTrigger>
          <DialogContent>
            <DialogTitle>Focus trap</DialogTitle>
            <Input aria-label="Trapped field" />
          </DialogContent>
        </Dialog>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const outside = canvas.getByRole("button", { name: "Outside counter" }),
      status = canvas.getByRole("status", { name: "Outside count" });
    await userEvent.click(canvas.getByRole("button", { name: "Open focus trap" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Focus trap" });
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Trapped field" })).toHaveFocus());
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: "Trapped field" })).toHaveFocus());
    await userEvent.click(outside);
    await expect(status).toHaveTextContent("1");
    await expect(outside).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const ImperativeClosing: Story = {
  render: function Render(args) {
    const actionsRef = useRef<DialogPrimitive.Root.Actions>(null);
    return (
      <Dialog {...args} actionsRef={actionsRef}>
        <DialogTrigger render={<Button />}>Open imperative editor</DialogTrigger>
        <DialogContent>
          <DialogTitle>Imperative editor</DialogTitle>
          <Button onClick={() => actionsRef.current?.close()}>Finish imperatively</Button>
        </DialogContent>
      </Dialog>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open imperative editor" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Imperative editor" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Finish imperatively" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "imperative-action" }),
    );
  },
};
export const NativeForm: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false),
      [saved, setSaved] = useState("");
    const id = useId();
    return (
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}>Open profile form</DialogTrigger>
          <DialogContent>
            <DialogTitle>Profile form</DialogTitle>
            <form
              aria-label="Profile form"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(String(new FormData(event.currentTarget).get("name")));
                setIsOpen(false);
              }}
            >
              <Field>
                <FieldLabel htmlFor={id}>Name</FieldLabel>
                <Input id={id} name="name" required defaultValue="Alex" />
              </Field>
              <Button type="reset">Reset name</Button>
              <Button type="submit">Save profile</Button>
            </form>
          </DialogContent>
        </Dialog>
        <output aria-label="Saved name">{saved}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open profile form" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Profile form" });
    const input = within(dialog).getByRole("textbox", { name: "Name" });
    await userEvent.clear(input);
    await userEvent.type(input, "Blair");
    await userEvent.click(within(dialog).getByRole("button", { name: "Reset name" }));
    await expect(input).toHaveValue("Alex");
    await userEvent.clear(input);
    await userEvent.click(within(dialog).getByRole("button", { name: "Save profile" }));
    await expect(input).toBeInvalid();
    await expect(input).toHaveFocus();
    await userEvent.type(input, "Blair");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Saved name" })).toHaveTextContent("Blair");
  },
};
export const DetachedTriggers: Story = {
  render: function Render() {
    const [handle] = useState(() => DialogPrimitive.createHandle<string>());
    return (
      <>
        <DialogTrigger handle={handle} payload="Alex" render={<Button />}>
          Detached Alex
        </DialogTrigger>
        <DialogTrigger handle={handle} payload="Blair" render={<Button />}>
          Detached Blair
        </DialogTrigger>
        <Dialog handle={handle}>
          {({ payload }) => (
            <DialogContent>
              <DialogTitle>Detached {payload}</DialogTitle>
              <DialogClose render={<Button />}>Done</DialogClose>
            </DialogContent>
          )}
        </Dialog>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Detached Blair" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Detached Blair" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

type ScrollableDialogProps = ComponentProps<typeof Dialog> & {
  hasFooter?: boolean;
  direction?: "ltr" | "rtl";
};

function ScrollableDialogExample({
  hasFooter = false,
  direction = "ltr",
  ...args
}: ScrollableDialogProps): ReactElement {
  return (
    <DirectionProvider direction={direction}>
      <div dir={direction}>
        <Dialog {...args}>
          <DialogTrigger render={<Button variant="outline" />}>Read project agreement</DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-2rem)]">
            <DialogHeader>
              <DialogTitle>Project agreement</DialogTitle>
              <DialogDescription>Review the project rules before continuing.</DialogDescription>
            </DialogHeader>
            <div
              role="region"
              aria-label="Agreement terms"
              tabIndex={0}
              className="flex max-h-[45dvh] min-h-0 flex-col gap-4 overflow-y-auto"
            >
              {Array.from({ length: 20 }, (_, index) => (
                <p key={index}>
                  Rule {index + 1}: Keep project changes accessible, test native interactions, and preserve clear
                  ownership of shared resources.
                </p>
              ))}
            </div>
            {hasFooter && (
              <DialogFooter>
                <DialogClose render={<Button />}>Accept agreement</DialogClose>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DirectionProvider>
  );
}

export const StickyFooter: Story = {
  render: (args) => <ScrollableDialogExample {...args} hasFooter />,
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Read project agreement" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Project agreement" });
    await waitFor(() => expect(dialog).toBeVisible());
    const canvas = within(dialog);
    const region = canvas.getByRole("region", { name: "Agreement terms" });
    const heading = canvas.getByRole("heading", { name: "Project agreement" });
    const accept = canvas.getByRole("button", { name: "Accept agreement" });
    const headerTop = heading.getBoundingClientRect().top;
    const footerTop = accept.getBoundingClientRect().top;
    await expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
    await userEvent.click(region);
    await expect(region).toHaveFocus();
    region.scrollTo({ top: region.scrollHeight, behavior: "instant" });
    await waitFor(() => expect(region.scrollTop).toBeGreaterThan(0));
    await expect(heading.getBoundingClientRect().top).toBe(headerTop);
    await expect(accept.getBoundingClientRect().top).toBe(footerTop);
    await expect(accept.getBoundingClientRect().top).toBeGreaterThanOrEqual(region.getBoundingClientRect().bottom);
    await expect(accept.getBoundingClientRect().bottom).toBeLessThanOrEqual(dialog.getBoundingClientRect().bottom);
    await userEvent.click(accept);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RTLStickyFooter: Story = {
  ...StickyFooter,
  render: (args) => <ScrollableDialogExample {...args} hasFooter direction="rtl" />,
};
export const ScrollableContent: Story = {
  render: (args) => <ScrollableDialogExample {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Read project agreement" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Project agreement" });
    await waitFor(() => expect(dialog).toBeVisible());
    const heading = within(dialog).getByRole("heading", { name: "Project agreement" });
    const top = heading.getBoundingClientRect().top;
    const region = within(dialog).getByRole("region", { name: "Agreement terms" });
    await expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
    region.scrollTo({ top: region.scrollHeight, behavior: "instant" });
    await waitFor(() => expect(region.scrollTop).toBeGreaterThan(0));
    await expect(heading.getBoundingClientRect().top).toBe(top);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RTLScrollableContent: Story = {
  ...ScrollableContent,
  render: (args) => <ScrollableDialogExample {...args} direction="rtl" />,
};
export const CustomCloseButton: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Dialog {...args}>
        <DialogTrigger render={<Button />}>Share project</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>Anyone with this link can view the project.</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={id}>Project link</FieldLabel>
            <Input id={id} readOnly defaultValue="https://example.com/project" />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Done sharing</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Share project" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Share link" });
    await expect(within(dialog).getByRole("textbox", { name: "Project link" })).toHaveValue(
      "https://example.com/project",
    );
    await expect(within(dialog).getByRole("textbox", { name: "Project link" })).toHaveAttribute("readonly");
    await expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Done sharing" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const NoCloseButton: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>Read information</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
          <DialogDescription>Press Escape to return.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Read information" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Information" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).queryByRole("button")).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

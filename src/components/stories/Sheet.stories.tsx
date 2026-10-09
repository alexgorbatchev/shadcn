import type { ComponentProps } from "react";
import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { Field, FieldGroup, FieldLabel } from "../Field";
import { Input } from "../Input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../Sheet";

type SheetStoryProps = ComponentProps<typeof SheetContent> & {
  titleClassName?: ComponentProps<typeof SheetTitle>["className"];
  descriptionClassName?: ComponentProps<typeof SheetDescription>["className"];
};
const meta: Meta<SheetStoryProps> = {
  title: "shadcn-alexgorbatchev/components/Sheet",
  component: SheetContent,
  tags: ["autodocs", "test"],
  args: { side: "right" },
  argTypes: {
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open preferences</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>Preferences</SheetTitle>
          <SheetDescription>Adjust your workspace preferences.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button />}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open preferences" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Preferences" });
    await waitFor(() => {
      const rect = dialog.getBoundingClientRect(),
        view = canvasElement.ownerDocument.defaultView!;
      const edges = {
        left: rect.left,
        top: rect.top,
        right: view.innerWidth - rect.right,
        bottom: view.innerHeight - rect.bottom,
      };
      expect(Math.abs(edges[args.side!])).toBeLessThanOrEqual(1);
    });
    await expect(dialog).toHaveAccessibleDescription("Adjust your workspace preferences.");
    await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "Preferences" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
export const Left: Story = { ...Default, args: { side: "left" } };
export const Top: Story = { ...Default, args: { side: "top" } };
export const Bottom: Story = { ...Default, args: { side: "bottom" } };
export const Compact: Story = { ...Default, args: { density: "compact", showCloseButton: false } };

export const StateCallbacks: Story = {
  args: { className: fn(() => "gap-8"), titleClassName: fn(() => "mb-2"), descriptionClassName: fn(() => "mt-2") },
  render: ({ titleClassName, descriptionClassName, ...args }) => (
    <Sheet>
      <SheetTrigger render={<Button />}>Open callback preferences</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle className={titleClassName}>Callback preferences</SheetTitle>
          <SheetDescription className={descriptionClassName}>Native sheet state and layout.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button />}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open callback preferences" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Callback preferences" });
    await expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    await expect(args.titleClassName).toHaveBeenCalled();
    await expect(args.descriptionClassName).toHaveBeenCalled();
    await expect(Number.parseFloat(getComputedStyle(dialog).gap)).toBeGreaterThan(16);
    const heading = within(dialog).getByRole("heading", { name: "Callback preferences" });
    await expect(Number.parseFloat(getComputedStyle(heading).marginBottom)).toBeGreaterThan(0);
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const RightToLeft: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  args: { side: "left" },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open preferences" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Preferences" });
    const close = within(dialog).getByRole("button", { name: "Close" });
    await waitFor(() => expect(close).toBeVisible());
    await expect(getComputedStyle(dialog).direction).toBe("rtl");
    await waitFor(() =>
      expect(close.getBoundingClientRect().left - dialog.getBoundingClientRect().left).toBeLessThanOrEqual(16),
    );
    await userEvent.click(close);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Payload: Story = {
  render: () => (
    <Sheet<string>>
      {({ payload }) => (
        <>
          <SheetTrigger<string> payload="Alpha" render={<Button />}>
            Edit Alpha
          </SheetTrigger>
          <SheetTrigger<string> payload="Beta" render={<Button />}>
            Edit Beta
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit {payload?.toUpperCase()}</SheetTitle>
            </SheetHeader>
            <SheetFooter>
              <SheetClose render={<Button />}>Done</SheetClose>
            </SheetFooter>
          </SheetContent>
        </>
      )}
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Edit Beta" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Edit BETA" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const NoCloseButton: Story = {
  ...Default,
  args: { showCloseButton: false },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open preferences" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Preferences" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RightToLeftNoCloseButton: Story = { ...NoCloseButton, decorators: RightToLeft.decorators };
export const RightToLeftRight: Story = { ...Default, decorators: RightToLeft.decorators };
export const RightToLeftTop: Story = { ...Top, decorators: RightToLeft.decorators };
export const RightToLeftBottom: Story = { ...Bottom, decorators: RightToLeft.decorators };

export const ProfileForm: Story = {
  render: function Render(args) {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false),
      [saved, setSaved] = useState("No changes saved");
    return (
      <div className="flex flex-col items-start gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={<Button variant="outline" />}>Edit profile</SheetTrigger>
          <SheetContent {...args}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>Save your workspace profile.</SheetDescription>
            </SheetHeader>
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved("Saved " + new FormData(event.currentTarget).get("name"));
                setIsOpen(false);
              }}
            >
              <FieldGroup className="px-panel">
                <Field>
                  <FieldLabel htmlFor={id}>Display name</FieldLabel>
                  <Input id={id} name="name" required />
                </Field>
              </FieldGroup>
              <SheetFooter>
                <Button type="submit">Save profile</Button>
                <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
        <output aria-label="Saved profile">{saved}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Edit profile" });
    const saved = canvas.getByRole("status", { name: "Saved profile" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Edit profile" });
    const name = within(dialog).getByRole("textbox", { name: "Display name" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Save profile" }));
    await expect(name).toBeInvalid();
    await expect(saved).toHaveTextContent("No changes saved");
    await userEvent.type(name, "Alex");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(saved).toHaveTextContent("Saved Alex");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    const reopened = await body.findByRole("dialog", { name: "Edit profile" });
    await userEvent.type(within(reopened).getByRole("textbox", { name: "Display name" }), "Discarded");
    await userEvent.click(within(reopened).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(reopened).not.toBeInTheDocument());
    await expect(saved).toHaveTextContent("Saved Alex");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RightToLeftProfileForm: Story = {
  ...ProfileForm,
  decorators: RightToLeft.decorators,
  args: { side: "left" },
};

export const CancelledOpening: Story = {
  render: (args) => (
    <Sheet
      onOpenChange={(isOpen, details) => {
        if (isOpen) details.cancel();
      }}
    >
      <SheetTrigger render={<Button />}>Restricted preferences</SheetTrigger>
      <SheetContent {...args}>
        <SheetTitle>Restricted preferences</SheetTitle>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Restricted preferences" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};

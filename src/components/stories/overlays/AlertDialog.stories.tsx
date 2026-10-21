import { useRef, useState } from "react";
import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { AlertDialogRootChangeEventDetails } from "@base-ui/react/alert-dialog";
import { expect, fn, waitFor, within } from "storybook/test";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogMedia,
  AlertDialogPortal,
  AlertDialogOverlay,
} from "../../AlertDialog";
import { DeleteConfirmationExample } from "../helpers";
import { Button } from "../../Button";
import { DensityProvider } from "../../DensityProvider";
import { DirectionProvider } from "../../DirectionProvider";
import { BellIcon } from "lucide-react";

const meta: Meta<typeof AlertDialog> = {
  title: "@alexgorbatchev/shadcn/components/overlays/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs", "test"],
  args: { onOpenChange: fn() },
  render: (args) => <DeleteConfirmationExample {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Delete this project?",
    });
    await expect(dialog).toHaveAccessibleDescription("This demonstration only changes local story state.");
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus());
    await expect(getComputedStyle(dialog).animationName === "none").toBe(
      canvasElement.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const overlay = canvasElement.ownerDocument.querySelector("[data-slot=alert-dialog-overlay]") as HTMLElement;
    await expect(getComputedStyle(overlay).animationName === "none").toBe(
      canvasElement.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "close-press" }));
    await expect(within(canvasElement).queryByRole("status")).not.toBeInTheDocument();
  },
};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  play: async ({ canvasElement, userEvent }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Delete this project?",
    });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const Confirm: Story = {
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Delete this project?",
    });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Project deleted.");
  },
};
type PermissionConfirmationProps = Pick<ComponentProps<typeof AlertDialog>, "onOpenChange"> &
  Pick<ComponentProps<typeof AlertDialogContent>, "size"> & {
    hasMedia?: boolean;
    direction?: "ltr" | "rtl";
  };

function PermissionConfirmationExample({
  size = "sm",
  hasMedia = false,
  direction = "ltr",
  onOpenChange,
}: PermissionConfirmationProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState("Notifications unchanged.");
  return (
    <DirectionProvider direction={direction}>
      <div dir={direction}>
        <AlertDialog
          open={isOpen}
          onOpenChange={(open, details) => {
            onOpenChange?.(open, details);
            if (!details.isCanceled) setIsOpen(open);
          }}
        >
          <AlertDialogTrigger render={<Button variant="outline" />}>Review permission</AlertDialogTrigger>
          <AlertDialogContent size={size}>
            <AlertDialogHeader>
              {hasMedia && (
                <AlertDialogMedia>
                  <BellIcon aria-hidden="true" />
                </AlertDialogMedia>
              )}
              <AlertDialogTitle>Allow notifications?</AlertDialogTitle>
              <AlertDialogDescription>Receive project updates.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setPermission("Notifications allowed.");
                  setIsOpen(false);
                }}
              >
                Allow
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <output aria-label="Permission state">{permission}</output>
      </div>
    </DirectionProvider>
  );
}

export const Small: Story = {
  render: (args) => <PermissionConfirmationExample {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Review permission" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Allow notifications?",
    });
    await expect(dialog.getBoundingClientRect().width).toBe(320);
    const cancel = within(dialog).getByRole("button", { name: "Cancel" }),
      allow = within(dialog).getByRole("button", { name: "Allow" });
    await expect(cancel.getBoundingClientRect().top).toBe(allow.getBoundingClientRect().top);
    await expect(
      (allow.getBoundingClientRect().left - cancel.getBoundingClientRect().left) *
        (1 - 2 * Number(getComputedStyle(dialog).direction === "rtl")),
    ).toBeGreaterThan(0);
    await userEvent.click(allow);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(within(canvasElement).getByRole("status", { name: "Permission state" })).toHaveTextContent(
      "Notifications allowed.",
    );
  },
};
export const Basic: Story = {
  ...Small,
  render: (args) => <PermissionConfirmationExample {...args} size="default" />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Review permission" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Allow notifications?",
    });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(dialog.getBoundingClientRect().width).toBeGreaterThan(320);
    await expect(dialog.querySelector("[data-slot=alert-dialog-media]")).toBeNull();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Permission state" })).toHaveTextContent(
      "Notifications unchanged.",
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const SmallWithMedia: Story = {
  ...Small,
  render: (args) => <PermissionConfirmationExample {...args} hasMedia />,
  play: async (context) => {
    const { canvasElement, userEvent } = context;
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Review permission" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Allow notifications?",
    });
    await waitFor(() => expect(dialog).toBeVisible());
    const media = dialog.querySelector("[data-slot=alert-dialog-media]") as HTMLElement;
    const title = within(dialog).getByRole("heading", { name: "Allow notifications?" });
    await expect(media).toBeVisible();
    await expect(media.getBoundingClientRect().bottom).toBeLessThanOrEqual(title.getBoundingClientRect().top);
    await expect(
      Math.abs(
        (media.getBoundingClientRect().left + media.getBoundingClientRect().right) / 2 -
          (title.getBoundingClientRect().left + title.getBoundingClientRect().right) / 2,
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await Small.play?.(context);
  },
};
export const RTLSmall: Story = {
  ...Small,
  render: (args) => <PermissionConfirmationExample {...args} direction="rtl" />,
};
export const RTLSmallWithMedia: Story = {
  ...SmallWithMedia,
  render: (args) => <PermissionConfirmationExample {...args} hasMedia direction="rtl" />,
};
export const RTLMedia: Story = {
  render: (args) => <PermissionConfirmationExample {...args} size="default" hasMedia direction="rtl" />,
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Review permission" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Allow notifications?",
    });
    await waitFor(() => expect(dialog).toBeVisible());
    const media = dialog.querySelector("[data-slot=alert-dialog-media]") as HTMLElement;
    const title = within(dialog).getByRole("heading", { name: "Allow notifications?" });
    await expect(getComputedStyle(dialog).direction).toBe("rtl");
    await expect(media.getBoundingClientRect().left).toBeGreaterThan(title.getBoundingClientRect().right);
    await userEvent.click(within(dialog).getByRole("button", { name: "Allow" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(within(canvasElement).getByRole("status", { name: "Permission state" })).toHaveTextContent(
      "Notifications allowed.",
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const OutsidePressBlocked: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Delete this project?",
    });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.click(canvasElement.ownerDocument.querySelector("[data-slot=alert-dialog-overlay]") as HTMLElement);
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Delete project" });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Delete this project?",
    });
    const cancel = within(dialog).getByRole("button", { name: "Cancel" }),
      action = within(dialog).getByRole("button", { name: "Delete" });
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(action).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const DisabledTrigger: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger disabled render={<Button />}>
        Unavailable confirmation
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Unavailable confirmation</AlertDialogTitle>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Unavailable confirmation" });
    await expect(trigger).toBeDisabled();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await expect(trigger).not.toHaveFocus();
  },
};
export const CancelledOpening: Story = {
  args: { onOpenChange: fn((_open: boolean, details: AlertDialogRootChangeEventDetails) => details.cancel()) },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete project" }));
    await waitFor(() =>
      expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: "trigger-press" })),
    );
    await expect(within(canvasElement.ownerDocument.body).queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
export const CancelledClosing: Story = {
  args: {
    onOpenChange: fn((open: boolean, details: AlertDialogRootChangeEventDetails) => {
      if (!open) details.cancel();
    }),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete project" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Delete this project?",
    });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "escape-key" }));
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "close-press" }));
    await waitFor(() => expect(dialog).toBeVisible());
  },
};
export const NativeCallbacks: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger className={(state) => (state.open ? "w-64" : "w-48")}>
        Callback confirmation
      </AlertDialogTrigger>
      <AlertDialogContent className={(state) => (state.open ? "w-64" : "w-48")}>
        <AlertDialogTitle className={() => "h-12"}>Callback confirmation title</AlertDialogTitle>
        <AlertDialogDescription className={() => "h-10"}>Callback description</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className={(state) => (state.disabled ? "h-12" : "h-8")}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Callback confirmation" });
    await expect(trigger.getBoundingClientRect().width).toBe(192);
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Callback confirmation title",
    });
    await waitFor(() => expect(trigger.getBoundingClientRect().width).toBe(256));
    await expect.soft(dialog.getBoundingClientRect().width).toBe(256);
    await expect
      .soft(within(dialog).getByRole("heading", { name: "Callback confirmation title" }).getBoundingClientRect().height)
      .toBe(48);
    await expect.soft(within(dialog).getByText("Callback description").getBoundingClientRect().height).toBe(40);
    await expect.soft(within(dialog).getByRole("button", { name: "Cancel" }).getBoundingClientRect().height).toBe(32);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const ActionCallback: Story = {
  render: function Render(args) {
    const [isDisabled, setIsDisabled] = useState(false);
    const [count, setCount] = useState(0);
    return (
      <AlertDialog {...args}>
        <AlertDialogTrigger render={<Button />}>Action example</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Action stays open</AlertDialogTitle>
          <AlertDialogAction
            disabled={isDisabled}
            className={(state) => (state.disabled ? "h-12" : "h-8")}
            onClick={() => setCount(count + 1)}
          >
            Run action
          </AlertDialogAction>
          <Button onClick={() => setIsDisabled(true)}>Disable action</Button>
          <output aria-label="Action count">{count}</output>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Action example" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Action stays open",
    });
    const action = within(dialog).getByRole("button", { name: "Run action" });
    await expect.soft(action.getBoundingClientRect().height).toBe(32);
    await userEvent.click(action);
    await expect(within(dialog).getByRole("status", { name: "Action count" })).toHaveTextContent("1");
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Disable action" }));
    await expect(action).toBeDisabled();
    await expect.soft(action.getBoundingClientRect().height).toBe(48);
    await userEvent.tab();
    await expect(action).not.toHaveFocus();
    await expect(within(dialog).getByRole("status", { name: "Action count" })).toHaveTextContent("1");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const OverlayCallback: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button />}>Open backdrop example</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay
          data-testid="AlertDialog--overlay"
          className={(state) => (state.open ? "opacity-50" : "opacity-0")}
        />
        <AlertDialogPrimitive.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover p-panel">
          <AlertDialogTitle>Backdrop example</AlertDialogTitle>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogPrimitive.Popup>
      </AlertDialogPortal>
    </AlertDialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open backdrop example" }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog", { name: "Backdrop example" });
    await waitFor(() => expect(getComputedStyle(body.getByTestId("AlertDialog--overlay")).opacity).toBe("0.5"));
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const CompactPortal: Story = {
  render: (args) => (
    <DensityProvider density="compact">
      <AlertDialog {...args}>
        <AlertDialogTrigger render={<Button />}>Compact confirmation</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Compact alert</AlertDialogTitle>
          <AlertDialogDescription>Compact portal content.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </DensityProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Compact confirmation" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", { name: "Compact alert" });
    await expect(dialog).toHaveAttribute("data-density", "compact");
    await expect(getComputedStyle(within(dialog).getByText("Compact portal content.")).fontSize).toBe("12px");
    await expect(within(dialog).getByRole("button", { name: "Cancel" }).getBoundingClientRect().height).toBe(20);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const RTL: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <section dir="rtl">
        <AlertDialog {...args}>
          <AlertDialogTrigger render={<Button />}>RTL confirmation</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>RTL alert</AlertDialogTitle>
              <AlertDialogDescription>Direction follows the portal.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "RTL confirmation" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", { name: "RTL alert" });
    await expect.soft(getComputedStyle(dialog).direction).toBe("rtl");
    await expect
      .soft(within(dialog).getByRole("heading", { name: "RTL alert" }).getBoundingClientRect().right)
      .toBeGreaterThan(dialog.getBoundingClientRect().left + dialog.getBoundingClientRect().width / 2);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const CustomFocusAndNativeRender: Story = {
  render: function Render(args) {
    const cancelRef = useRef<HTMLButtonElement>(null),
      finalRef = useRef<HTMLButtonElement>(null),
      popupRef = useRef<HTMLDivElement>(null);
    return (
      <>
        <Button ref={finalRef}>Return target</Button>
        <AlertDialog {...args}>
          <AlertDialogTrigger render={<button type="button" />}>Custom confirmation</AlertDialogTrigger>
          <AlertDialogContent render={<section />} ref={popupRef} initialFocus={cancelRef} finalFocus={finalRef}>
            <AlertDialogTitle>Custom confirmation title</AlertDialogTitle>
            <AlertDialogAction>Action</AlertDialogAction>
            <AlertDialogCancel ref={cancelRef}>Cancel</AlertDialogCancel>
            <Button onClick={() => popupRef.current?.focus()}>Focus surface</Button>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Custom confirmation" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Custom confirmation title",
    });
    await expect(dialog.tagName).toBe("SECTION");
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.click(within(dialog).getByRole("button", { name: "Focus surface" }));
    await expect(dialog).toHaveFocus();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole("button", { name: "Return target" })).toHaveFocus());
  },
};
export const Payload: Story = {
  render: () => (
    <AlertDialog<string>>
      {({ payload }) => (
        <>
          <AlertDialogTrigger<string> payload="Alex">Remove Alex</AlertDialogTrigger>
          <AlertDialogTrigger<string> payload="Blair">Remove Blair</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Remove {payload}?</AlertDialogTitle>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </>
      )}
    </AlertDialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Remove Blair" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", { name: "Remove Blair?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Controlled: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open controlled confirmation</Button>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent>
            <AlertDialogTitle>Controlled confirmation</AlertDialogTitle>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
        <output aria-label="Confirmation state">{String(isOpen)}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status", { name: "Confirmation state" });
    await userEvent.click(canvas.getByRole("button", { name: "Open controlled confirmation" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Controlled confirmation",
    });
    await expect(status).toHaveTextContent("true");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(status).toHaveTextContent("false");
  },
};

export const Media: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button />}>Review media confirmation</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia data-testid="AlertDialog--media">
            <BellIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Notification settings</AlertDialogTitle>
          <AlertDialogDescription>Confirm workspace notification settings.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Review media confirmation" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Notification settings",
    });
    const media = within(dialog).getByTestId("AlertDialog--media").getBoundingClientRect(),
      title = within(dialog).getByRole("heading", { name: "Notification settings" }).getBoundingClientRect();
    await expect(media.width).toBe(40);
    await expect(media.right).toBeLessThan(title.left);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const DetachedTriggers: Story = {
  render: function Render() {
    const [handle] = useState(() => AlertDialogPrimitive.createHandle<string>());
    return (
      <>
        <AlertDialogTrigger handle={handle} payload="Alex" render={<Button />}>
          Detached Alex
        </AlertDialogTrigger>
        <AlertDialogTrigger handle={handle} payload="Blair" render={<Button />}>
          Detached Blair
        </AlertDialogTrigger>
        <AlertDialog handle={handle}>
          {({ payload }) => (
            <AlertDialogContent>
              <AlertDialogTitle>Remove detached {payload}?</AlertDialogTitle>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Detached Blair" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", {
      name: "Remove detached Blair?",
    });
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

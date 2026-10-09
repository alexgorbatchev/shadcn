import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button";
import { DensityProvider } from "../DensityProvider";
import { DirectionProvider } from "../DirectionProvider";
import { ResponsiveDrawerExample } from "./helpers";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../Drawer";

const meta: Meta<typeof Drawer> = {
  title: "shadcn-alexgorbatchev/components/Drawer",
  component: Drawer,
  tags: ["autodocs", "test"],
  argTypes: {
    swipeDirection: { control: "select", options: ["down", "up", "left", "right"] },
    showSwipeHandle: { control: "boolean" },
    modal: { control: "select", options: [true, false, "trap-focus"] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger render={<Button variant="outline" />}>Open details</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Project details</DrawerTitle>
          <DrawerDescription>Review the project before continuing.</DrawerDescription>
        </DrawerHeader>
        <div className="p-panel">Three tasks are ready.</div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open details" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Project details" });
    await expect(dialog).toHaveAccessibleDescription("Review the project before continuing.");
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "Project details" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
export const Up: Story = { ...Default, args: { swipeDirection: "up", showSwipeHandle: true } };
export const Left: Story = { ...Default, args: { swipeDirection: "left", showSwipeHandle: true } };
export const Right: Story = { ...Default, args: { swipeDirection: "right", modal: false } };
export const SnapPoints: Story = {
  ...Default,
  args: { snapPoints: [0.5, 1], defaultSnapPoint: 0.5, showSwipeHandle: true },
};
export const FocusTrap: Story = { ...Default, args: { modal: "trap-focus" } };

const nestedClassName = fn(() => "font-normal");
export const Nested: Story = {
  render: (args) => (
    <DensityProvider density="compact">
      <Drawer {...args} showSwipeHandle>
        <DrawerTrigger render={<Button />}>Open parent</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Parent drawer</DrawerTitle>
            <DrawerDescription>Choose a task.</DrawerDescription>
          </DrawerHeader>
          <div className="p-panel">
            <Drawer showSwipeHandle>
              <DrawerTrigger render={<Button />}>Open child</DrawerTrigger>
              <DrawerContent className={nestedClassName}>
                <DrawerHeader>
                  <DrawerTitle>Child drawer</DrawerTitle>
                  <DrawerDescription>Review this task.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose render={<Button />}>Close child</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Close parent</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </DensityProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const parentTrigger = within(canvasElement).getByRole("button", { name: "Open parent" });
    await userEvent.click(parentTrigger);
    const parent = await body.findByRole("dialog", { name: "Parent drawer" });
    const childTrigger = within(parent).getByRole("button", { name: "Open child" });
    await expect(childTrigger.getBoundingClientRect().height).toBe(parentTrigger.getBoundingClientRect().height);
    await userEvent.click(childTrigger);
    const child = await body.findByRole("dialog", { name: "Child drawer" });
    await expect(nestedClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true, nested: true }));
    await userEvent.click(within(child).getByRole("button", { name: "Close child" }));
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Child drawer" })).not.toBeInTheDocument());
    await expect(childTrigger).toHaveFocus();
    await userEvent.click(within(parent).getByRole("button", { name: "Close parent" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const Scrollable: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button />}>Open activity</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Project activity</DrawerTitle>
          <DrawerDescription>Review the complete activity log.</DrawerDescription>
        </DrawerHeader>
        <div role="region" aria-label="Activity log" tabIndex={0} className="flex-1 overflow-y-auto p-panel">
          {Array.from({ length: 50 }, (_, index) => (
            <p key={index} className="py-4">
              Activity {index + 1}: Project update recorded.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Finish review</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open activity" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Project activity" });
    const region = within(dialog).getByRole("region", { name: "Activity log" });
    const footer = within(dialog).getByRole("button", { name: "Finish review" });
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() =>
      expect(
        Math.abs(dialog.getBoundingClientRect().bottom - canvasElement.ownerDocument.defaultView!.innerHeight),
      ).toBeLessThanOrEqual(1),
    );
    await expect(dialog.getBoundingClientRect().height).toBeLessThanOrEqual(
      canvasElement.ownerDocument.defaultView!.innerHeight - 95,
    );
    await expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
    const heading = within(dialog).getByRole("heading", { name: "Project activity" });
    const range = canvasElement.ownerDocument.createRange();
    range.selectNodeContents(heading);
    const textRect = range.getBoundingClientRect(),
      headingRect = heading.getBoundingClientRect();
    const gaps: Record<string, number> = {
      ltr: textRect.left - headingRect.left,
      rtl: headingRect.right - textRect.right,
    };
    await expect(Math.abs(gaps[getComputedStyle(dialog).direction]!)).toBeLessThanOrEqual(1);
    const footerTop = footer.getBoundingClientRect().top;
    region.scrollTo({ top: region.scrollHeight, behavior: "instant" });
    await waitFor(() => expect(region.scrollTop).toBeGreaterThan(0));
    await expect(Math.abs(footer.getBoundingClientRect().top - footerTop)).toBeLessThanOrEqual(1);
    await userEvent.click(footer);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
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
  args: { swipeDirection: "right", showSwipeHandle: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open details" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Project details" });
    const heading = within(dialog).getByRole("heading", { name: "Project details" });
    await waitFor(() => expect(heading).toBeVisible());
    await expect(getComputedStyle(dialog).direction).toBe("rtl");
    await expect(getComputedStyle(heading.parentElement!).textAlign).toBe("start");
    const range = canvasElement.ownerDocument.createRange();
    range.selectNodeContents(heading);
    await expect(
      Math.abs(range.getBoundingClientRect().right - heading.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const Payload: Story = {
  render: () => (
    <Drawer<string>>
      {({ payload }) => (
        <>
          <DrawerTrigger<string> payload="Alpha" render={<Button />}>
            Review Alpha
          </DrawerTrigger>
          <DrawerTrigger<string> payload="Beta" render={<Button />}>
            Review Beta
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Review {payload?.toUpperCase()}</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose render={<Button />}>Done</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </>
      )}
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Review Beta" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Review BETA" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const RightToLeftScrollable: Story = { ...Scrollable, decorators: RightToLeft.decorators };
export const RightToLeftUp: Story = { ...Up, decorators: RightToLeft.decorators };
export const RightToLeftLeft: Story = { ...Left, decorators: RightToLeft.decorators };

export const SwipeHandle: Story = {
  ...Default,
  args: { showSwipeHandle: true },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open details" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Project details" });
    const handle = dialog.querySelector('[data-slot="drawer-swipe-handle"]')!;
    await waitFor(() => expect(handle).toBeVisible());
    await waitFor(() =>
      expect(
        Math.abs(dialog.getBoundingClientRect().bottom - canvasElement.ownerDocument.defaultView!.innerHeight),
      ).toBeLessThanOrEqual(1),
    );
    await expect(handle).toHaveAttribute("aria-hidden", "true");
    await expect(getComputedStyle(handle, "::after").height).toBe("4px");
    const rect = handle.getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: handle,
        coords: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      },
      {
        target: handle,
        coords: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 + 10 },
      },
      {
        target: handle,
        coords: { x: rect.left + rect.width / 2, y: canvasElement.ownerDocument.defaultView!.innerHeight + 200 },
      },
      { keys: "[/MouseLeft]" },
    ]);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const NonModal: Story = {
  args: { modal: false },
  render: function Render(args) {
    const [count, setCount] = useState(0);
    return (
      <div className="flex flex-col items-start gap-4">
        <Button onClick={() => setCount(count + 1)}>Outside counter</Button>
        <output aria-label="Outside count">{count}</output>
        <Drawer {...args} disablePointerDismissal swipeDirection="right">
          <DrawerTrigger render={<Button />}>Open persistent drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Persistent drawer</DrawerTitle>
              <DrawerDescription>The page remains interactive.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose render={<Button />}>Done</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const counter = canvas.getByRole("button", { name: "Outside counter" });
    const count = canvas.getByRole("status", { name: "Outside count" });
    await userEvent.click(canvas.getByRole("button", { name: "Open persistent drawer" }));
    const dialog = await body.findByRole("dialog", { name: "Persistent drawer" });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(counter);
    await expect(count).toHaveTextContent("1");
    await expect(dialog).toBeVisible();
    await expect(canvasElement.ownerDocument.querySelector('[data-slot="drawer-overlay"]')).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const RightToLeftNonModal: Story = { ...NonModal, decorators: RightToLeft.decorators };
export const TrappedFocus: Story = {
  ...NonModal,
  args: { modal: "trap-focus" },
  play: async (context) => {
    const { canvasElement } = context;
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open persistent drawer" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Persistent drawer" });
    await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
    await userEvent.tab();
    await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await NonModal.play?.(context);
  },
};

export const ControlledSnapPoints: Story = {
  render: function Render() {
    const [point, setPoint] = useState<ComponentProps<typeof Drawer>["snapPoint"]>(0.5);
    return (
      <Drawer snapPoints={[0.5, 1]} snapPoint={point} onSnapPointChange={setPoint} showSwipeHandle>
        <DrawerTrigger render={<Button />}>Open snap controls</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Snap controls</DrawerTitle>
            <DrawerDescription>Choose a compact or expanded view.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-1 flex-col gap-4 p-panel">
            <Button onClick={() => setPoint(1)}>Expand drawer</Button>
            <Button onClick={() => setPoint(0.5)}>Compact drawer</Button>
            <output aria-label="Active snap point">{point}</output>
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open snap controls" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Snap controls" });
    const view = canvasElement.ownerDocument.defaultView!;
    await waitFor(() =>
      expect(Math.abs(dialog.getBoundingClientRect().top - view.innerHeight / 2)).toBeLessThanOrEqual(2),
    );
    await expect(within(dialog).getByRole("status", { name: "Active snap point" })).toHaveTextContent("0.5");
    await userEvent.click(within(dialog).getByRole("button", { name: "Expand drawer" }));
    await waitFor(() => expect(dialog).toHaveAttribute("data-expanded"));
    await waitFor(() => expect(dialog.getBoundingClientRect().top).toBeLessThanOrEqual(97));
    await expect(within(dialog).getByRole("status", { name: "Active snap point" })).toHaveTextContent("1");
    await userEvent.click(within(dialog).getByRole("button", { name: "Compact drawer" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("data-expanded"));
    await waitFor(() =>
      expect(Math.abs(dialog.getBoundingClientRect().top - view.innerHeight / 2)).toBeLessThanOrEqual(2),
    );
    const handle = dialog.querySelector('[data-slot="drawer-swipe-handle"]')!,
      rect = handle.getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: handle,
        coords: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      },
      { target: handle, coords: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 - 10 } },
      { target: handle, coords: { x: rect.left + rect.width / 2, y: 100 } },
      { keys: "[/MouseLeft]" },
    ]);
    await waitFor(() => expect(dialog).toHaveAttribute("data-expanded"));
    await expect(within(dialog).getByRole("status", { name: "Active snap point" })).toHaveTextContent("1");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const RightToLeftControlledSnapPoints: Story = { ...ControlledSnapPoints, decorators: RightToLeft.decorators };

export const Responsive: Story = {
  render: () => <ResponsiveDrawerExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      trigger = canvas.getByRole("button", { name: "Edit responsive profile" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Responsive profile" });
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Profile name" }), "Alex");
    await userEvent.click(within(dialog).getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Responsive saved profile" })).toHaveTextContent("Saved Alex");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RightToLeftResponsive: Story = { ...Responsive, decorators: RightToLeft.decorators };

export const CustomHeight: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger render={<Button />}>Open half-height drawer</DrawerTrigger>
      <DrawerContent className="h-[50vh]">
        <DrawerHeader>
          <DrawerTitle>Half-height drawer</DrawerTitle>
          <DrawerDescription>A custom viewport-relative height.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open half-height drawer" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Half-height drawer" });
    await waitFor(() =>
      expect(
        Math.abs(dialog.getBoundingClientRect().height - canvasElement.ownerDocument.defaultView!.innerHeight / 2),
      ).toBeLessThanOrEqual(1),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const CustomWidth: Story = {
  render: (args) => (
    <Drawer {...args} swipeDirection="right">
      <DrawerTrigger render={<Button />}>Open custom-width drawer</DrawerTrigger>
      <DrawerContent className="w-80">
        <DrawerHeader>
          <DrawerTitle>Custom-width drawer</DrawerTitle>
          <DrawerDescription>A custom side-panel width.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open custom-width drawer" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Custom-width drawer" });
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().width - 320)).toBeLessThanOrEqual(1));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const Inset: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger render={<Button />}>Open floating drawer</DrawerTrigger>
      <DrawerContent className="[--drawer-inset:1rem]">
        <DrawerHeader>
          <DrawerTitle>Floating drawer</DrawerTitle>
          <DrawerDescription>Inset from the viewport edges.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open floating drawer" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Floating drawer" });
    await waitFor(() => {
      const rect = dialog.getBoundingClientRect(),
        view = canvasElement.ownerDocument.defaultView!;
      expect(Math.abs(rect.left - 16)).toBeLessThanOrEqual(1);
      expect(Math.abs(view.innerWidth - rect.right - 16)).toBeLessThanOrEqual(1);
      expect(Math.abs(view.innerHeight - rect.bottom - 16)).toBeLessThanOrEqual(1);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

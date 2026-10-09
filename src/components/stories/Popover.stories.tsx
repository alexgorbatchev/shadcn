import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";
import { useId, useRef, useState } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "../Popover";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { DensityProvider } from "../DensityProvider";
import { Field, FieldGroup, FieldLabel } from "../Field";
import { Input } from "../Input";

const meta: Meta<typeof Popover> = {
  title: "shadcn-alexgorbatchev/components/Popover",
  component: Popover,
  tags: ["autodocs", "test"],
  args: { onOpenChange: fn(), onOpenChangeComplete: fn() },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>Project details</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Local workspace</PopoverTitle>
          <PopoverDescription>All services are running.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Project details" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Local workspace" });
    await expect(dialog).toHaveAccessibleDescription("All services are running.");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "300px" } } },
  play: async ({ canvasElement, userEvent }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Local workspace" });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const Modal: Story = { ...Default, args: { modal: true } };

export const NativeCallbacks: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button />}>Callback popup</PopoverTrigger>
      <PopoverContent className={(state) => (state.open ? "min-w-80" : "min-w-0")}>
        <PopoverTitle className={() => "h-12"}>Callback title</PopoverTitle>
        <PopoverDescription className={() => "min-h-10"}>Callback description</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Callback popup" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Callback title" });
    await expect.soft(dialog.getBoundingClientRect().width).toBeGreaterThanOrEqual(320);
    await expect
      .soft(within(dialog).getByRole("heading", { name: "Callback title" }).getBoundingClientRect().height)
      .toBe(48);
    await expect.soft(within(dialog).getByText("Callback description").getBoundingClientRect().height).toBe(40);
  },
};

export const MotionPreference: Story = {
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Project details" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Local workspace" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(getComputedStyle(dialog).animationName === "none").toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const RightToLeftStartAligned: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="flex justify-center py-32">
        <Popover {...args}>
          <PopoverTrigger render={<Button />}>RTL placement</PopoverTrigger>
          <PopoverContent align="start">
            <PopoverTitle>RTL details</PopoverTitle>
          </PopoverContent>
        </Popover>
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "RTL placement" });
    await userEvent.click(trigger);
    const popup = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "RTL details" });
    await waitFor(() => expect(popup).toBeVisible());
    await expect(getComputedStyle(popup).direction).toBe("rtl");
    await waitFor(() =>
      expect(Math.abs(popup.getBoundingClientRect().right - trigger.getBoundingClientRect().right)).toBeLessThanOrEqual(
        1,
      ),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Payload: Story = {
  render: () => (
    <Popover<string>>
      {({ payload }) => (
        <>
          <PopoverTrigger<string> payload="Alex" render={<Button />}>
            View Alex
          </PopoverTrigger>
          <PopoverTrigger<string> payload="Blair" render={<Button />}>
            View Blair
          </PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Profile: {payload?.toUpperCase()}</PopoverTitle>
          </PopoverContent>
        </>
      )}
    </Popover>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "View Blair" });
    await userEvent.click(trigger);
    const popup = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Profile: BLAIR" });
    await waitFor(() => expect(popup).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

type PlacementProps = ComponentProps<typeof Popover> &
  Pick<ComponentProps<typeof PopoverContent>, "align" | "side"> & { direction?: "ltr" | "rtl" };
function PlacementExample({
  align = "start",
  side = "bottom",
  direction = "ltr",
  ...args
}: PlacementProps): ReactElement {
  return (
    <DirectionProvider direction={direction}>
      <div dir={direction} className="flex justify-center py-32">
        <Popover {...args}>
          <PopoverTrigger render={<Button variant="outline" />}>Placement details</PopoverTrigger>
          <PopoverContent align={align} side={side} sideOffset={8}>
            <PopoverTitle>Aligned popup</PopoverTitle>
            <PopoverDescription>Native popup positioning.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </div>
    </DirectionProvider>
  );
}
async function openPlacement(canvasElement: HTMLElement) {
  const trigger = within(canvasElement).getByRole("button", { name: "Placement details" });
  await userEvent.click(trigger);
  const popup = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Aligned popup" });
  await waitFor(() => expect(popup).toBeVisible());
  return { trigger, popup };
}
async function closePlacement(trigger: HTMLElement, popup: HTMLElement) {
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(popup).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
}
export const StartAligned: Story = {
  render: (args) => <PlacementExample {...args} />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await waitFor(() =>
      expect(Math.abs(popup.getBoundingClientRect().left - trigger.getBoundingClientRect().left)).toBeLessThanOrEqual(
        1,
      ),
    );
    await expect(
      Math.abs(popup.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom - 8),
    ).toBeLessThanOrEqual(1);
    await closePlacement(trigger, popup);
  },
};
export const CenterAligned: Story = {
  render: (args) => <PlacementExample {...args} align="center" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await waitFor(() =>
      expect(
        Math.abs(
          (popup.getBoundingClientRect().left + popup.getBoundingClientRect().right) / 2 -
            (trigger.getBoundingClientRect().left + trigger.getBoundingClientRect().right) / 2,
        ),
      ).toBeLessThanOrEqual(1),
    );
    await closePlacement(trigger, popup);
  },
};
export const EndAligned: Story = {
  render: (args) => <PlacementExample {...args} align="end" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await waitFor(() =>
      expect(Math.abs(popup.getBoundingClientRect().right - trigger.getBoundingClientRect().right)).toBeLessThanOrEqual(
        1,
      ),
    );
    await closePlacement(trigger, popup);
  },
};
export const RightToLeftEndAligned: Story = {
  render: (args) => <PlacementExample {...args} align="end" direction="rtl" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await expect(getComputedStyle(popup).direction).toBe("rtl");
    await waitFor(() =>
      expect(Math.abs(popup.getBoundingClientRect().left - trigger.getBoundingClientRect().left)).toBeLessThanOrEqual(
        1,
      ),
    );
    await closePlacement(trigger, popup);
  },
};
export const Top: Story = {
  render: (args) => <PlacementExample {...args} side="top" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await waitFor(() =>
      expect(
        Math.abs(trigger.getBoundingClientRect().top - popup.getBoundingClientRect().bottom - 8),
      ).toBeLessThanOrEqual(1),
    );
    await closePlacement(trigger, popup);
  },
};
export const Left: Story = {
  render: (args) => <PlacementExample {...args} side="left" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await waitFor(() =>
      expect(
        Math.abs(trigger.getBoundingClientRect().left - popup.getBoundingClientRect().right - 8),
      ).toBeLessThanOrEqual(1),
    );
    await closePlacement(trigger, popup);
  },
};
export const Right: Story = {
  render: (args) => <PlacementExample {...args} side="right" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await waitFor(() =>
      expect(
        Math.abs(popup.getBoundingClientRect().left - trigger.getBoundingClientRect().right - 8),
      ).toBeLessThanOrEqual(1),
    );
    await closePlacement(trigger, popup);
  },
};

type DimensionsFormProps = ComponentProps<typeof Popover> & { direction?: "ltr" | "rtl" };
function DimensionsFormExample({ direction = "ltr", onOpenChange, ...args }: DimensionsFormProps): ReactElement {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState("");
  return (
    <DirectionProvider direction={direction}>
      <div dir={direction} className="flex flex-col items-center gap-4 py-16">
        <Popover
          {...args}
          open={isOpen}
          onOpenChange={(open, details) => {
            onOpenChange?.(open, details);
            if (!details.isCanceled) setIsOpen(open);
          }}
        >
          <PopoverTrigger render={<Button variant="outline" />}>Edit dimensions</PopoverTrigger>
          <PopoverContent align="start">
            <PopoverHeader>
              <PopoverTitle>Dimensions</PopoverTitle>
              <PopoverDescription>Set the layer dimensions in pixels.</PopoverDescription>
            </PopoverHeader>
            <form
              aria-label="Layer dimensions"
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(JSON.stringify(Object.fromEntries(data)));
                setIsOpen(false);
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${id}-width`}>Width</FieldLabel>
                  <Input id={`${id}-width`} name="width" type="number" min={1} required defaultValue={100} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-height`}>Height</FieldLabel>
                  <Input id={`${id}-height`} name="height" type="number" min={1} required defaultValue={25} />
                </Field>
              </FieldGroup>
              <div className="flex gap-2">
                <Button type="reset" variant="outline">
                  Reset dimensions
                </Button>
                <Button type="submit">Save dimensions</Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        <output aria-label="Saved dimensions">{saved}</output>
      </div>
    </DirectionProvider>
  );
}
export const NativeForm: Story = {
  render: (args) => <DimensionsFormExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Edit dimensions" });
    await userEvent.click(trigger);
    const popup = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Dimensions" });
    const width = within(popup).getByRole("spinbutton", { name: "Width" });
    await waitFor(() => expect(width).toHaveFocus());
    await userEvent.clear(width);
    await userEvent.click(within(popup).getByRole("button", { name: "Save dimensions" }));
    await expect(width).toBeInvalid();
    await expect(width).toHaveFocus();
    await userEvent.type(width, "120");
    await userEvent.click(within(popup).getByRole("button", { name: "Reset dimensions" }));
    await expect(width).toHaveValue(100);
    await userEvent.clear(width);
    await userEvent.type(width, "240");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Saved dimensions" })).toHaveTextContent(
      '{"width":"240","height":"25"}',
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RTLNativeForm: Story = {
  ...NativeForm,
  render: (args) => <DimensionsFormExample {...args} direction="rtl" />,
};
export const CancelledOpening: Story = {
  ...Default,
  args: { onOpenChange: fn((_open, details) => details.cancel()) },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Project details" }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};
export const CancelledClosing: Story = {
  render: (args) => <PlacementExample {...args} />,
  args: {
    onOpenChange: fn((open, details) => {
      if (!open) details.cancel();
    }),
  },
  play: async ({ canvasElement, args }) => {
    const { popup } = await openPlacement(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    await expect(popup).toBeVisible();
  },
};
export const CompactPortal: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <DensityProvider density="compact">
        <Popover {...args}>
          <PopoverTrigger render={<Button />}>Placement details</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Aligned popup</PopoverTitle>
            <Field>
              <FieldLabel htmlFor={id}>Project ID</FieldLabel>
              <Input id={id} readOnly defaultValue="project-42" />
            </Field>
          </PopoverContent>
        </Popover>
      </DensityProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openPlacement(canvasElement);
    await expect(within(popup).getByRole("textbox", { name: "Project ID" }).getBoundingClientRect().height).toBe(20);
    await closePlacement(trigger, popup);
  },
};

export const CustomFocusAndNativeRender: Story = {
  render: function Render(args) {
    const inputRef = useRef<HTMLInputElement>(null);
    const finalRef = useRef<HTMLButtonElement>(null);
    const id = useId();
    return (
      <>
        <Button ref={finalRef}>Return destination</Button>
        <Popover {...args}>
          <PopoverTrigger render={<Button />}>Custom focus popup</PopoverTrigger>
          <PopoverContent initialFocus={inputRef} finalFocus={finalRef} ref={popupRef} render={<section />}>
            <PopoverTitle>Custom focus details</PopoverTitle>
            <Field>
              <FieldLabel htmlFor={id}>Project name</FieldLabel>
              <Input id={id} ref={inputRef} defaultValue="Alex" />
            </Field>
            <PopoverPrimitive.Close render={<Button variant="outline" />}>Done</PopoverPrimitive.Close>
          </PopoverContent>
        </Popover>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Custom focus popup" }));
    const popup = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Custom focus details" });
    await waitFor(() => expect(within(popup).getByRole("textbox", { name: "Project name" })).toHaveFocus());
    await expect(popup.tagName).toBe("SECTION");
    await expect(popupRef).toHaveBeenCalledWith(popup);
    await userEvent.click(within(popup).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole("button", { name: "Return destination" })).toHaveFocus());
  },
};
const popupRef = fn();

export const ModalFocusTrap: Story = {
  render: (args) => (
    <Popover {...args} modal>
      <PopoverTrigger render={<Button />}>Open modal popup</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Modal details</PopoverTitle>
        <Button>First action</Button>
        <PopoverPrimitive.Close render={<Button />}>Close popup</PopoverPrimitive.Close>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open modal popup" });
    await userEvent.click(trigger);
    const popup = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Modal details" });
    const first = within(popup).getByRole("button", { name: "First action" });
    const close = within(popup).getByRole("button", { name: "Close popup" });
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(close).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.click(close);
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

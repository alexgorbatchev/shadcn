import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";
import { useState } from "react";
import { SaveIcon } from "lucide-react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../Tooltip";
import { Button } from "../../Button";
import { DirectionProvider } from "../../DirectionProvider";
import { Kbd } from "../../Kbd";

const meta: Meta<typeof Tooltip> = {
  title: "@alexgorbatchev/shadcn/components/overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs", "test"],
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>Hover or focus</TooltipTrigger>
      <TooltipContent>Save your changes.</TooltipContent>
    </Tooltip>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Hover or focus" });
    await userEvent.hover(trigger);
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent(
        "Save your changes.",
      ),
    );
    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).not.toBeInTheDocument(),
    );
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).not.toBeInTheDocument(),
    );
  },
};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "220px" } } },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).toBeVisible(),
    );
  },
};
export const Below: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>Below</TooltipTrigger>
      <TooltipContent side="bottom">Additional information.</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Below" });
    await userEvent.hover(trigger);
    await waitFor(() => {
      const popup = canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]');
      expect(popup).toHaveTextContent("Additional information.");
      expect(popup?.getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger.getBoundingClientRect().bottom);
    });
  },
};

export const NativeCallback: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button />}>Callback hint</TooltipTrigger>
      <TooltipContent className={(state) => (state.open ? "min-w-80" : "min-w-0")}>
        Native callback hint.
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Callback hint" }));
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')?.getBoundingClientRect().width,
      ).toBeGreaterThanOrEqual(320),
    );
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  render: () => (
    <div className="p-32">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>RTL hint</TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          معلومات إضافية عن المشروع
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "RTL hint" });
    await userEvent.hover(trigger);
    const popup = await within(canvasElement.ownerDocument.body).findByText("معلومات إضافية عن المشروع");
    await waitFor(() => expect(popup).toBeVisible());
    await expect(getComputedStyle(popup).direction).toBe("rtl");
    await waitFor(() =>
      expect(Math.abs(popup.getBoundingClientRect().right - trigger.getBoundingClientRect().right)).toBeLessThanOrEqual(
        1,
      ),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const Payload: Story = {
  render: () => (
    <Tooltip<string>>
      {({ payload }) => (
        <div className="flex gap-4 p-32">
          <TooltipTrigger<string> payload="Alpha" render={<Button />}>
            Preview Alpha
          </TooltipTrigger>
          <TooltipTrigger<string> payload="Beta" render={<Button />}>
            Preview Beta
          </TooltipTrigger>
          <TooltipContent>Project: {payload?.toUpperCase()}</TooltipContent>
        </div>
      )}
    </Tooltip>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(canvas.getByRole("button", { name: "Preview Alpha" }));
    await waitFor(() => expect(body.getByText("Project: ALPHA")).toBeVisible());
    await userEvent.unhover(canvas.getByRole("button", { name: "Preview Alpha" }));
    await waitFor(() => expect(body.queryByText("Project: ALPHA")).not.toBeInTheDocument());
    await userEvent.hover(canvas.getByRole("button", { name: "Preview Beta" }));
    await waitFor(() => expect(body.getByText("Project: BETA")).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};

type HintSide = NonNullable<ComponentProps<typeof TooltipContent>["side"]>;
type PhysicalSide = "top" | "bottom" | "left" | "right";
interface PlacementHintProps {
  side: HintSide;
}

function PlacementHint({ side }: PlacementHintProps): ReactElement {
  return (
    <div className="flex justify-center p-32">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>Placement hint</TooltipTrigger>
        <TooltipContent side={side}>Project information</TooltipContent>
      </Tooltip>
    </div>
  );
}

async function exercisePlacement(
  canvasElement: HTMLElement,
  side: PhysicalSide,
  nativeSide: HintSide = side,
): Promise<void> {
  const trigger = within(canvasElement).getByRole("button", { name: "Placement hint" });
  trigger.focus();
  const popup = await within(canvasElement.ownerDocument.body).findByText("Project information");
  await waitFor(() => expect(popup).toBeVisible());
  await waitFor(() => {
    const anchor = trigger.getBoundingClientRect(),
      rect = popup.getBoundingClientRect();
    const gaps: Record<PhysicalSide, number> = {
      top: anchor.top - rect.bottom,
      bottom: rect.top - anchor.bottom,
      left: anchor.left - rect.right,
      right: rect.left - anchor.right,
    };
    expect(popup).toHaveAttribute("data-side", nativeSide);
    expect(Math.abs(gaps[side] - 4)).toBeLessThanOrEqual(1);
    const arrow = popup.querySelector('[aria-hidden="true"]')!.getBoundingClientRect();
    const centerX = (arrow.left + arrow.right) / 2,
      centerY = (arrow.top + arrow.bottom) / 2;
    const arrowEdges: Record<PhysicalSide, number> = {
      top: centerY - rect.bottom,
      bottom: centerY - rect.top,
      left: centerX - rect.right,
      right: centerX - rect.left,
    };
    expect(Math.abs(arrowEdges[side])).toBeLessThanOrEqual(8);
  });
  trigger.blur();
  await waitFor(() => expect(popup).not.toBeInTheDocument());
}

export const Top: Story = {
  render: () => <PlacementHint side="top" />,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "top"),
};
export const Bottom: Story = {
  render: () => <PlacementHint side="bottom" />,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "bottom"),
};
export const Left: Story = {
  render: () => <PlacementHint side="left" />,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "left"),
};
export const Right: Story = {
  render: () => <PlacementHint side="right" />,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "right"),
};
export const InlineStart: Story = {
  render: () => <PlacementHint side="inline-start" />,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "left", "inline-start"),
};
export const InlineEnd: Story = {
  render: () => <PlacementHint side="inline-end" />,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "right", "inline-end"),
};
export const RightToLeftTop: Story = { ...Top, decorators: RightToLeft.decorators };
export const RightToLeftBottom: Story = { ...Bottom, decorators: RightToLeft.decorators };
export const RightToLeftLeft: Story = { ...Left, decorators: RightToLeft.decorators };
export const RightToLeftRight: Story = { ...Right, decorators: RightToLeft.decorators };
export const RightToLeftInlineStart: Story = {
  ...InlineStart,
  decorators: RightToLeft.decorators,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "right", "inline-start"),
};
export const RightToLeftInlineEnd: Story = {
  ...InlineEnd,
  decorators: RightToLeft.decorators,
  play: ({ canvasElement }) => exercisePlacement(canvasElement, "left", "inline-end"),
};

export const KeyboardShortcut: Story = {
  render: function Render() {
    const [count, setCount] = useState(0);
    return (
      <div className="flex flex-col items-start gap-4 p-32">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" size="icon-sm" aria-label="Save changes" onClick={() => setCount(count + 1)} />
            }
          >
            <SaveIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>
            Save changes <Kbd>S</Kbd>
          </TooltipContent>
        </Tooltip>
        <output aria-label="Save count">{count}</output>
      </div>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Save changes" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const key = await body.findByText("S", { selector: "kbd" });
    await waitFor(() => expect(key).toBeVisible());
    await userEvent.click(trigger);
    await expect(canvas.getByRole("status", { name: "Save count" })).toHaveTextContent("1");
    await waitFor(() => expect(key).not.toBeInTheDocument());
  },
};
export const RightToLeftKeyboardShortcut: Story = {
  ...KeyboardShortcut,
  decorators: RightToLeft.decorators,
  play: async (context) => {
    const { canvasElement, userEvent } = context;
    const trigger = within(canvasElement).getByRole("button", { name: "Save changes" });
    await userEvent.hover(trigger);
    const key = await within(canvasElement.ownerDocument.body).findByText("S", { selector: "kbd" });
    await waitFor(() => expect(key).toBeVisible());
    await expect(
      key.getBoundingClientRect().left - key.parentElement!.getBoundingClientRect().left,
    ).toBeLessThanOrEqual(8);
    await userEvent.unhover(trigger);
    await waitFor(() => expect(key).not.toBeInTheDocument());
    await KeyboardShortcut.play?.(context);
  },
};

export const DisabledButton: Story = {
  render: () => (
    <div className="p-32">
      <Tooltip>
        <TooltipTrigger render={<span tabIndex={0} aria-label="Feature availability" className="inline-block w-fit" />}>
          <Button variant="outline" disabled>
            Unavailable save
          </Button>
        </TooltipTrigger>
        <TooltipContent>This feature is currently unavailable.</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const wrapper = canvas.getByLabelText("Feature availability"),
      button = canvas.getByRole("button", { name: "Unavailable save" });
    await expect(button).toBeDisabled();
    await userEvent.hover(wrapper);
    const hint = await body.findByText("This feature is currently unavailable.");
    await waitFor(() => expect(hint).toBeVisible());
    await userEvent.unhover(wrapper);
    await waitFor(() => expect(hint).not.toBeInTheDocument());
    await userEvent.tab();
    await expect(wrapper).toHaveFocus();
    await waitFor(() => expect(body.getByText("This feature is currently unavailable.")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByText("This feature is currently unavailable.")).not.toBeInTheDocument());
  },
};
export const RightToLeftDisabledButton: Story = { ...DisabledButton, decorators: RightToLeft.decorators };

export const CancelledOpening: Story = {
  args: { onOpenChange: fn((_isOpen, details) => details.cancel()) },
  play: async ({ canvasElement, args, userEvent }) => {
    await userEvent.tab();
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything()));
    await expect(within(canvasElement.ownerDocument.body).queryByText("Save your changes.")).not.toBeInTheDocument();
  },
};

export const ProviderDelay: Story = {
  render: (args) => (
    <TooltipProvider delay={150}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button />}>Delayed hint</TooltipTrigger>
        <TooltipContent>Delay completed.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const start = performance.now();
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Delayed hint" }));
    const hint = await within(canvasElement.ownerDocument.body).findByText("Delay completed.");
    await expect(performance.now() - start).toBeGreaterThanOrEqual(140);
    await waitFor(() => expect(hint).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(hint).not.toBeInTheDocument());
  },
};

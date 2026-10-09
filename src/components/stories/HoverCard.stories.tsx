import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../HoverCard";
import { DirectionProvider } from "../DirectionProvider";
import { DensityProvider } from "../DensityProvider";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { fixture_avatarImage } from "./fixtures";
import { Button } from "../Button";

const meta: Meta<typeof HoverCard> = {
  title: "shadcn-alexgorbatchev/components/HoverCard",
  component: HoverCard,
  tags: ["autodocs", "test"],
  args: { onOpenChange: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;
const contentClassName = fn(() => "font-normal");
export const Default: Story = {
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger href="#profile" delay={0} closeDelay={0}>
        Alex's profile
      </HoverCardTrigger>
      <HoverCardContent>
        <p>Builds accessible component libraries.</p>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("link", { name: "Alex's profile" });
    await expect(trigger).toHaveAttribute("href", "#profile");
    await userEvent.hover(trigger);
    await waitFor(() => expect(body.getByText("Builds accessible component libraries.")).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByText("Builds accessible component libraries.")).not.toBeInTheDocument());
  },
};
export const StateCallback: Story = {
  ...Default,
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger href="#profile" delay={0} closeDelay={0}>
        Alex's profile
      </HoverCardTrigger>
      <HoverCardContent density="compact" className={contentClassName}>
        <p>Builds accessible component libraries.</p>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async (context) => {
    await Default.play?.(context);
    await expect(contentClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
  },
};

type ProfilePreviewProps = ComponentProps<typeof HoverCard> &
  Pick<ComponentProps<typeof HoverCardContent>, "side" | "align"> &
  Pick<ComponentProps<typeof HoverCardTrigger>, "closeDelay">;

function ProfilePreview({
  side = "bottom",
  align = "start",
  closeDelay = 0,
  ...args
}: ProfilePreviewProps): ReactElement {
  return (
    <div className="flex justify-center py-32">
      <HoverCard {...args}>
        <HoverCardTrigger href="#profile" target="_self" delay={0} closeDelay={closeDelay}>
          Alex's profile
        </HoverCardTrigger>
        <HoverCardContent side={side} sideOffset={8} align={align} alignOffset={0}>
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={fixture_avatarImage} alt="Alex" />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p>Profile preview</p>
              <p>Builds accessible component libraries.</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

async function openProfilePreview(canvasElement: HTMLElement) {
  const trigger = within(canvasElement).getByRole("link", { name: "Alex's profile" });
  await userEvent.hover(trigger);
  const title = await within(canvasElement.ownerDocument.body).findByText("Profile preview");
  await waitFor(() => expect(title).toBeVisible());
  const popup = title.closest("[data-slot=hover-card-content]") as HTMLElement;
  return { trigger, popup };
}

async function closeProfilePreview(trigger: HTMLElement, popup: HTMLElement) {
  await userEvent.unhover(trigger);
  await waitFor(() => expect(popup).not.toBeInTheDocument());
}

function RTLProfilePreview(props: ProfilePreviewProps): ReactElement {
  return (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <ProfilePreview {...props} />
      </div>
    </DirectionProvider>
  );
}

export const RightToLeftEndAligned: Story = {
  render: (args) => <RTLProfilePreview {...args} align="end" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await expect(getComputedStyle(popup).direction).toBe("rtl");
    await waitFor(() =>
      expect(popup.getBoundingClientRect().left).toBeCloseTo(trigger.getBoundingClientRect().left, 0),
    );
    await closeProfilePreview(trigger, popup);
  },
};
export const RightToLeftInlineStart: Story = {
  render: (args) => <RTLProfilePreview {...args} side="inline-start" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await expect(getComputedStyle(popup).direction).toBe("rtl");
    await waitFor(() =>
      expect(popup.getBoundingClientRect().left - trigger.getBoundingClientRect().right).toBeCloseTo(8, 0),
    );
    await closeProfilePreview(trigger, popup);
  },
};
export const RightToLeftInlineEnd: Story = {
  render: (args) => <RTLProfilePreview {...args} side="inline-end" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await expect(getComputedStyle(popup).direction).toBe("rtl");
    await waitFor(() =>
      expect(trigger.getBoundingClientRect().left - popup.getBoundingClientRect().right).toBeCloseTo(8, 0),
    );
    await closeProfilePreview(trigger, popup);
  },
};

export const Bottom: Story = {
  render: (args) => <ProfilePreview {...args} />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await waitFor(() =>
      expect(popup.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom).toBeCloseTo(8, 0),
    );
    await expect(popup.getBoundingClientRect().left).toBeCloseTo(trigger.getBoundingClientRect().left, 0);
    await expect(await within(popup).findByRole("img", { name: "Alex" })).toBeVisible();
    await closeProfilePreview(trigger, popup);
  },
};
export const Top: Story = {
  render: (args) => <ProfilePreview {...args} side="top" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await waitFor(() =>
      expect(trigger.getBoundingClientRect().top - popup.getBoundingClientRect().bottom).toBeCloseTo(8, 0),
    );
    await closeProfilePreview(trigger, popup);
  },
};
export const Left: Story = {
  render: (args) => <ProfilePreview {...args} side="left" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await waitFor(() =>
      expect(trigger.getBoundingClientRect().left - popup.getBoundingClientRect().right).toBeCloseTo(8, 0),
    );
    await closeProfilePreview(trigger, popup);
  },
};
export const Right: Story = {
  render: (args) => <ProfilePreview {...args} side="right" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await waitFor(() =>
      expect(popup.getBoundingClientRect().left - trigger.getBoundingClientRect().right).toBeCloseTo(8, 0),
    );
    await closeProfilePreview(trigger, popup);
  },
};
export const EndAligned: Story = {
  render: (args) => <ProfilePreview {...args} align="end" />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await waitFor(() =>
      expect(popup.getBoundingClientRect().right).toBeCloseTo(trigger.getBoundingClientRect().right, 0),
    );
    await closeProfilePreview(trigger, popup);
  },
};
export const CompactPortal: Story = {
  render: (args) => (
    <DensityProvider density="compact">
      <ProfilePreview {...args} />
    </DensityProvider>
  ),
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await expect(getComputedStyle(popup).fontSize).toBe("12px");
    await expect(getComputedStyle(popup).paddingTop).toBe("8px");
    await expect(Number.parseFloat(getComputedStyle(popup).animationDuration)).toBe(
      0.1 * Number(!canvasElement.ownerDocument.defaultView!.matchMedia("(prefers-reduced-motion: reduce)").matches),
    );
    await closeProfilePreview(trigger, popup);
  },
};

export const TriggerDelays: Story = {
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger href="#profile" delay={200} closeDelay={250}>
        Delayed profile
      </HoverCardTrigger>
      <HoverCardContent>Delayed preview</HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole("link", { name: "Delayed profile" });
    const openingStarted = performance.now();
    await userEvent.hover(trigger);
    const preview = await body.findByText("Delayed preview");
    await expect(performance.now() - openingStarted).toBeGreaterThanOrEqual(180);
    await waitFor(() => expect(preview).toBeVisible());
    const closingStarted = performance.now();
    await userEvent.unhover(trigger);
    await expect(preview).toBeVisible();
    await waitFor(() => expect(preview).not.toBeInTheDocument());
    await expect(performance.now() - closingStarted).toBeGreaterThanOrEqual(230);
  },
};

export const KeyboardNavigation: Story = {
  render: (args) => (
    <>
      <ProfilePreview {...args} />
      <a href="#next">Next destination</a>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("link", { name: "Alex's profile" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const body = within(canvasElement.ownerDocument.body);
    const preview = await body.findByText("Profile preview");
    await waitFor(() => expect(preview).toBeVisible());
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Next destination" })).toHaveFocus();
    await waitFor(() => expect(preview).not.toBeInTheDocument());
    await userEvent.tab({ shift: true });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvasElement.ownerDocument.location.hash).toBe("#profile");
  },
};
export const RightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="flex justify-center py-32">
        <HoverCard {...args}>
          <HoverCardTrigger href="#profile" delay={0} closeDelay={0}>
            ملف أليكس
          </HoverCardTrigger>
          <HoverCardContent align="start" alignOffset={0}>
            <p>يبني مكتبات مكونات قابلة للوصول.</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("link", { name: "ملف أليكس" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(trigger);
    const text = await body.findByText("يبني مكتبات مكونات قابلة للوصول.");
    await waitFor(() => expect(text).toBeVisible());
    await expect(getComputedStyle(text).direction).toBe("rtl");
    await waitFor(() =>
      expect(text.parentElement!.getBoundingClientRect().right).toBeCloseTo(trigger.getBoundingClientRect().right, 0),
    );
    await userEvent.unhover(trigger);
    await waitFor(() => expect(text).not.toBeInTheDocument());
  },
};

export const Payload: Story = {
  render: () => (
    <HoverCard<string>>
      {({ payload }) => (
        <div className="flex justify-center gap-8 py-32">
          <HoverCardTrigger<string> href="#alex" delay={0} closeDelay={0} payload="Alex">
            Preview Alex
          </HoverCardTrigger>
          <HoverCardTrigger<string> href="#blair" delay={0} closeDelay={0} payload="Blair">
            Preview Blair
          </HoverCardTrigger>
          <HoverCardContent>Profile: {payload?.toUpperCase()}</HoverCardContent>
        </div>
      )}
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const alex = canvas.getByRole("link", { name: "Preview Alex" });
    const blair = canvas.getByRole("link", { name: "Preview Blair" });
    await userEvent.hover(alex);
    await waitFor(() => expect(body.getByText("Profile: ALEX")).toBeVisible());
    await userEvent.unhover(alex);
    await waitFor(() => expect(body.queryByText("Profile: ALEX")).not.toBeInTheDocument());
    await userEvent.hover(blair);
    await waitFor(() => expect(body.getByText("Profile: BLAIR")).toBeVisible());
    await userEvent.unhover(blair);
    await waitFor(() => expect(body.queryByText("Profile: BLAIR")).not.toBeInTheDocument());
  },
};

export const CancelledOpening: Story = {
  ...Default,
  args: { onOpenChange: fn((_open, details) => details.cancel()) },
  play: async ({ canvasElement, args }) => {
    await userEvent.hover(within(canvasElement).getByRole("link", { name: "Alex's profile" }));
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything()));
    await expect(
      within(canvasElement.ownerDocument.body).queryByText("Builds accessible component libraries."),
    ).not.toBeInTheDocument();
  },
};
export const CancelledClosing: Story = {
  render: (args) => <ProfilePreview {...args} />,
  args: {
    onOpenChange: fn((open, details) => {
      if (!open) details.cancel();
    }),
  },
  play: async ({ canvasElement, args }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await userEvent.unhover(trigger);
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
    await expect(popup).toBeVisible();
  },
};
export const PointerTransfer: Story = {
  render: (args) => <ProfilePreview {...args} closeDelay={200} />,
  play: async ({ canvasElement }) => {
    const { trigger, popup } = await openProfilePreview(canvasElement);
    await userEvent.unhover(trigger);
    await userEvent.hover(popup);
    await expect(popup).toBeVisible();
    await userEvent.unhover(popup);
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};
export const NativeRenderAndRefs: Story = {
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger href="#profile" delay={0} closeDelay={0} render={<a />} ref={triggerRef}>
        Rendered profile
      </HoverCardTrigger>
      <HoverCardContent render={<section aria-label="Profile details" />} ref={popupRef}>
        Native preview
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("link", { name: "Rendered profile" });
    await expect(triggerRef).toHaveBeenCalledWith(trigger);
    await expect(trigger).toHaveAttribute("href", "#profile");
    await userEvent.hover(trigger);
    const popup = await within(canvasElement.ownerDocument.body).findByRole("region", { name: "Profile details" });
    await waitFor(() => expect(popup).toBeVisible());
    await expect(popupRef).toHaveBeenCalledWith(popup);
    await closeProfilePreview(trigger, popup);
  },
};
const triggerRef = fn();
const popupRef = fn();

export const Controlled: Story = {
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(!isOpen)}>Toggle preview</Button>
        <HoverCard
          {...args}
          triggerId="controlled-profile"
          open={isOpen}
          onOpenChange={(open, details) => {
            args.onOpenChange?.(open, details);
            setIsOpen(open);
          }}
        >
          <HoverCardTrigger id="controlled-profile" href="#profile" delay={0} closeDelay={0}>
            Controlled profile
          </HoverCardTrigger>
          <HoverCardContent>Controlled preview</HoverCardContent>
        </HoverCard>
        <output aria-label="Preview state">{String(isOpen)}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const toggle = canvas.getByRole("button", { name: "Toggle preview" });
    await userEvent.click(toggle);
    const popup = await body.findByText("Controlled preview");
    await waitFor(() => expect(popup).toBeVisible());
    await expect(canvas.getByLabelText("Preview state")).toHaveTextContent("true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Preview state")).toHaveTextContent("false");
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, buttonVariants } from "../Button";
import { expect, fn, userEvent, within } from "storybook/test";
import { ArrowRightIcon, BookmarkIcon } from "lucide-react";
import { Spinner } from "../Spinner";

const meta: Meta<typeof Button> = {
  title: "shadcn-alexgorbatchev/components/Button",
  component: Button,
  tags: ["autodocs", "test"],
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "success", "warning", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" {Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};
export const Outline: Story = { tags: ["visual"], ...Default, args: { variant: "outline" } };
export const Secondary: Story = { ...Default, args: { variant: "secondary" } };
export const Ghost: Story = { ...Default, args: { variant: "ghost" } };
export const Destructive: Story = { tags: ["visual"], ...Default, args: { variant: "destructive" } };
export const Success: Story = { ...Default, args: { variant: "success" } };
export const Warning: Story = { ...Default, args: { variant: "warning" } };
export const Link: Story = { ...Default, args: { variant: "link" } };
export const Disabled: Story = {
  tags: ["visual"],
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const WithIcon: Story = {
  ...Default,
  args: {
    children: (
      <>
        Next
        <ArrowRightIcon data-icon="inline-end" />
      </>
    ),
  },
};
export const Loading: Story = {
  tags: ["visual"],
  ...Disabled,
  args: {
    disabled: true,
    children: (
      <>
        <Spinner data-icon="inline-start" />
        Saving
      </>
    ),
  },
  play: async (context) => {
    await Disabled.play?.(context);
    await expect(within(context.canvasElement).getByRole("status", { name: "Loading" })).toBeVisible();
  },
};
export const SizeXs: Story = { ...Default, args: { size: "xs" } };
export const SizeSm: Story = { ...Default, args: { size: "sm" } };
export const SizeLg: Story = { ...Default, args: { size: "lg" } };
export const Icon: Story = {
  ...Default,
  args: { size: "icon", "aria-label": "Next page", children: <ArrowRightIcon /> },
};
export const IconXs: Story = {
  ...Default,
  args: { size: "icon-xs", "aria-label": "Next page", children: <ArrowRightIcon /> },
};
export const IconSm: Story = {
  ...Default,
  args: { size: "icon-sm", "aria-label": "Next page", children: <ArrowRightIcon /> },
};
export const IconLg: Story = {
  ...Default,
  args: { size: "icon-lg", "aria-label": "Next page", children: <ArrowRightIcon /> },
};

export const StateCallback: Story = {
  ...Default,
  args: { className: fn(() => "font-normal") },
  play: async (context) => {
    await Default.play?.(context);
    await expect(context.args.className).toHaveBeenCalledWith({ disabled: false });
  },
};
export const FocusableDisabled: Story = {
  args: { disabled: true, focusableWhenDisabled: true, className: fn(() => "font-normal") },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard(" {Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(args.className).toHaveBeenCalledWith({ disabled: true });
  },
};

export const RightToLeftIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <Button {...args} dir="ltr" aria-label="Leading LTR">
        <BookmarkIcon data-icon="inline-start" />
        <span>Save</span>
      </Button>
      <Button {...args} dir="rtl" aria-label="Leading RTL">
        <BookmarkIcon data-icon="inline-start" />
        <span>Save</span>
      </Button>
      <Button {...args} dir="ltr" aria-label="Trailing LTR">
        <span>Save</span>
        <BookmarkIcon data-icon="inline-end" />
      </Button>
      <Button {...args} dir="rtl" aria-label="Trailing RTL">
        <span>Save</span>
        <BookmarkIcon data-icon="inline-end" />
      </Button>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const leadingLtr = canvas.getByRole("button", { name: "Leading LTR" });
    const leadingRtl = canvas.getByRole("button", { name: "Leading RTL" });
    const trailingLtr = canvas.getByRole("button", { name: "Trailing LTR" });
    const trailingRtl = canvas.getByRole("button", { name: "Trailing RTL" });
    const leadingLtrIcon = leadingLtr.querySelector("svg") as SVGElement;
    const leadingRtlIcon = leadingRtl.querySelector("svg") as SVGElement;
    const trailingLtrIcon = trailingLtr.querySelector("svg") as SVGElement;
    const trailingRtlIcon = trailingRtl.querySelector("svg") as SVGElement;
    await expect(leadingRtlIcon.getBoundingClientRect().left).toBeGreaterThan(
      within(leadingRtl).getByText("Save").getBoundingClientRect().right,
    );
    await expect(trailingRtlIcon.getBoundingClientRect().right).toBeLessThan(
      within(trailingRtl).getByText("Save").getBoundingClientRect().left,
    );
    await expect(leadingRtl.getBoundingClientRect().right - leadingRtlIcon.getBoundingClientRect().right).toBeCloseTo(
      leadingLtrIcon.getBoundingClientRect().left - leadingLtr.getBoundingClientRect().left,
      1,
    );
    await expect(trailingRtlIcon.getBoundingClientRect().left - trailingRtl.getBoundingClientRect().left).toBeCloseTo(
      trailingLtr.getBoundingClientRect().right - trailingLtrIcon.getBoundingClientRect().right,
      1,
    );
    await userEvent.click(leadingRtl);
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
export const ExtraSmallRightToLeftIcons: Story = { ...RightToLeftIcons, args: { size: "xs" } };
export const SmallRightToLeftIcons: Story = { ...RightToLeftIcons, args: { size: "sm" } };
export const LargeRightToLeftIcons: Story = { ...RightToLeftIcons, args: { size: "lg" } };
export const CompactRightToLeftIcons: Story = { ...RightToLeftIcons, args: { density: "compact" } };
export const Rounded: Story = {
  ...Default,
  args: { className: "rounded-full" },
  play: async (context) => {
    await Default.play?.(context);
    const button = within(context.canvasElement).getByRole("button");
    await expect(Number.parseFloat(getComputedStyle(button).borderTopLeftRadius)).toBeGreaterThanOrEqual(
      button.getBoundingClientRect().height / 2,
    );
  },
};
const onLogin = fn();
export const AsLink: Story = {
  render: () => (
    <a
      href="#login"
      className={buttonVariants({ variant: "outline" })}
      onClick={(event) => {
        event.preventDefault();
        onLogin();
      }}
    >
      Login
    </a>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Login" });
    await expect(link).toHaveAttribute("href", "#login");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onLogin).toHaveBeenCalledOnce();
  },
};

export const StartAligned: Story = {
  args: { align: "start", className: "w-64", children: "Start aligned" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Start aligned" });
    const range = button.ownerDocument.createRange();
    range.selectNodeContents(button);
    const style = getComputedStyle(button);
    await expect(range.getBoundingClientRect().left).toBeCloseTo(
      button.getBoundingClientRect().left + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth),
      1,
    );
  },
};

export const Inline: Story = {
  args: { variant: "link", size: "inline", align: "start", children: "Track title" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Track title" });
    const text = canvasElement.ownerDocument.createRange();
    text.selectNodeContents(button);
    await expect(text.getBoundingClientRect().left).toBe(button.getBoundingClientRect().left);
    await expect(button.getBoundingClientRect().height).toBeLessThanOrEqual(
      parseFloat(getComputedStyle(button).lineHeight),
    );
  },
};
export const EndAligned: Story = {
  args: { align: "end", className: "w-64", children: "End aligned" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "End aligned" });
    const range = button.ownerDocument.createRange();
    range.selectNodeContents(button);
    const style = getComputedStyle(button);
    await expect(range.getBoundingClientRect().right).toBeCloseTo(
      button.getBoundingClientRect().right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth),
      1,
    );
  },
};

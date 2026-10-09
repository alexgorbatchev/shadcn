import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { PlusIcon } from "lucide-react";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "../Avatar";
import { fixture_avatarImage } from "./fixtures";

type AvatarStoryProps = ComponentProps<typeof Avatar> & {
  imageClassName?: ComponentProps<typeof AvatarImage>["className"];
  imageRef?: ComponentProps<typeof AvatarImage>["ref"];
  fallbackClassName?: ComponentProps<typeof AvatarFallback>["className"];
  fallbackRef?: ComponentProps<typeof AvatarFallback>["ref"];
};
const meta: Meta<AvatarStoryProps> = {
  title: "shadcn-alexgorbatchev/components/Avatar",
  component: Avatar,
  tags: ["autodocs", "test"],
  argTypes: { size: { control: "select", options: ["default", "sm", "lg"] } },
  render: ({ imageClassName, imageRef, fallbackClassName, fallbackRef, ...args }) => (
    <Avatar {...args}>
      <AvatarImage src={fixture_avatarImage} alt="Alex" className={imageClassName} ref={imageRef} />
      <AvatarFallback className={fallbackClassName} ref={fallbackRef}>
        AG
      </AvatarFallback>
    </Avatar>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Image: Story = {
  play: async ({ canvasElement }) => {
    const image = await within(canvasElement).findByRole("img", { name: "Alex" });
    await expect(image).toBeVisible();
    const canvas = canvasElement.ownerDocument.createElement("canvas");
    canvas.width = canvas.height = 32;
    const context = canvas.getContext("2d");
    await expect(context).not.toBeNull();
    context?.drawImage(image as HTMLImageElement, 0, 0, 32, 32);
    const pixels = context?.getImageData(0, 0, 32, 32).data ?? [];
    const brightness: number[] = [];
    for (let index = 0; index < pixels.length; index += 4) {
      brightness.push((pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3);
    }
    await expect(Math.max(...brightness) - Math.min(...brightness)).toBeGreaterThan(100);
    await expect(within(canvasElement).queryByText("AG")).not.toBeInTheDocument();
  },
};
export const Small: Story = { ...Image, args: { size: "sm" } };
export const Large: Story = { ...Image, args: { size: "lg" } };
export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="data:image/png;base64,invalid" alt="Alex" />
      <AvatarFallback>AG</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("AG")).toBeVisible();
    await expect(within(canvasElement).queryByRole("img", { name: "Alex" })).not.toBeInTheDocument();
  },
};
export const Group: Story = {
  render: () => (
    <AvatarGroup aria-label="Project members">
      <Avatar>
        <AvatarFallback>AG</AvatarFallback>
        <AvatarBadge aria-label="Online" />
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("AG")).toBeVisible();
    await expect(await canvas.findByText("JD")).toBeVisible();
    await expect(canvas.getByText("+3")).toBeVisible();
    await expect(canvas.getByLabelText("Online")).toBeVisible();
  },
};
export const StateCallback: Story = {
  args: { className: fn(() => "") },
  play: async ({ canvasElement, args }) => {
    await expect(await within(canvasElement).findByRole("img", { name: "Alex" })).toBeVisible();
    await waitFor(() =>
      expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ imageLoadingStatus: "loaded" })),
    );
  },
};

export const ImageCallback: Story = {
  args: { imageClassName: fn(() => "p-1"), imageRef: fn() },
  play: async ({ canvasElement, args }) => {
    const image = await within(canvasElement).findByRole("img", { name: "Alex" });
    await expect(args.imageClassName).toHaveBeenCalledWith(expect.objectContaining({ imageLoadingStatus: "loaded" }));
    await expect(args.imageRef).toHaveBeenCalledWith(image);
    await expect(Number.parseFloat(getComputedStyle(image).paddingTop)).toBeGreaterThan(0);
    await expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0);
    await expect(within(canvasElement).queryByText("AG")).not.toBeInTheDocument();
  },
};
export const FallbackCallback: Story = {
  args: { fallbackClassName: fn(() => "p-1"), fallbackRef: fn() },
  render: (args) => (
    <Avatar>
      <AvatarFallback className={args.fallbackClassName} ref={args.fallbackRef}>
        AG
      </AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement, args }) => {
    const fallback = await within(canvasElement).findByText("AG");
    await expect(args.fallbackClassName).toHaveBeenCalled();
    await expect(args.fallbackRef).toHaveBeenCalledWith(fallback);
    await expect(Number.parseFloat(getComputedStyle(fallback).paddingTop)).toBeGreaterThan(0);
    await expect(fallback).toBeVisible();
  },
};

export const BadgeWithIcon: Story = {
  args: { size: "lg" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AG</AvatarFallback>
      <AvatarBadge aria-label="Available">
        <PlusIcon aria-hidden="true" />
      </AvatarBadge>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = (await canvas.findByText("AG")).parentElement as HTMLElement;
    const badge = canvas.getByLabelText("Available");
    const icon = badge.querySelector("svg") as SVGElement;
    await expect(icon).toBeVisible();
    await expect(badge.getBoundingClientRect().right).toBeCloseTo(avatar.getBoundingClientRect().right, 0);
    await expect(badge.getBoundingClientRect().bottom).toBeCloseTo(avatar.getBoundingClientRect().bottom, 0);
    await expect(icon.getBoundingClientRect().width).toBeLessThan(badge.getBoundingClientRect().width);
  },
};
export const SmallBadgeWithIcon: Story = {
  ...BadgeWithIcon,
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const badge = await within(canvasElement).findByLabelText("Available");
    await expect(badge).toBeVisible();
    await expect(badge.querySelector("svg")).not.toBeVisible();
    await expect(badge.getBoundingClientRect().width).toBeLessThan(
      (badge.parentElement as HTMLElement).getBoundingClientRect().width,
    );
  },
};
export const GroupWithIcon: Story = {
  render: (args) => (
    <AvatarGroup aria-label="Project members">
      <Avatar {...args}>
        <AvatarFallback>AG</AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <AvatarGroupCount aria-label="Three more members">
        <PlusIcon aria-hidden="true" />
      </AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = (await canvas.findByText("AG")).getBoundingClientRect();
    const second = (await canvas.findByText("JD")).getBoundingClientRect();
    const count = canvas.getByLabelText("Three more members");
    await expect(count).toBeVisible();
    await expect(second.left).toBeLessThan(first.right);
    await expect(second.left).toBeGreaterThan(first.left);
    await expect(count.getBoundingClientRect().height).toBe(first.height);
    await expect(count.querySelector("svg")).toBeVisible();
  },
};
export const SmallGroupWithIcon: Story = { ...GroupWithIcon, args: { size: "sm" } };
export const LargeGroupWithIcon: Story = { ...GroupWithIcon, args: { size: "lg" } };
export const RightToLeft: Story = {
  render: () => (
    <AvatarGroup dir="rtl" aria-label="Project members">
      <Avatar>
        <AvatarFallback>AG</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = (await canvas.findByText("AG")).getBoundingClientRect();
    const second = (await canvas.findByText("JD")).getBoundingClientRect();
    const count = canvas.getByText("+3").getBoundingClientRect();
    await expect(second.right).toBeGreaterThan(first.left);
    await expect(second.right).toBeLessThan(first.right);
    await expect(count.right).toBeGreaterThan(second.left);
    await expect(count.right).toBeLessThan(second.right);
  },
};
export const Dropdown: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" aria-label="Account menu" />}>
        <Avatar>
          <AvatarImage src={fixture_avatarImage} alt="Alex" />
          <AvatarFallback>AG</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={args.onClick}>Profile</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Account menu" });
    await expect(await canvas.findByRole("img", { name: "Alex" })).toBeVisible();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const item = await body.findByRole("menuitem", { name: "Profile" });
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

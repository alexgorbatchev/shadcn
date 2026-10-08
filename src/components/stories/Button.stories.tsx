import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
import { fn } from "storybook/test";
import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "shadcn-alexgorbatchev/components/Button",
  component: Button,
  tags: ["autodocs", "!test"],
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

export const Default: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Link: Story = { args: { variant: "link" } };
export const Disabled: Story = { args: { disabled: true } };
export const WithIcon: Story = {
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
  args: {
    disabled: true,
    children: (
      <>
        <LoaderCircleIcon data-icon="inline-start" />
        Saving
      </>
    ),
  },
};
export const SizeXs: Story = { args: { size: "xs" } };
export const SizeSm: Story = { args: { size: "sm" } };
export const SizeLg: Story = { args: { size: "lg" } };
export const Icon: Story = {
  args: { size: "icon", "aria-label": "Next page", children: <ArrowRightIcon /> },
};
export const IconXs: Story = {
  args: { size: "icon-xs", "aria-label": "Next page", children: <ArrowRightIcon /> },
};
export const IconSm: Story = {
  args: { size: "icon-sm", "aria-label": "Next page", children: <ArrowRightIcon /> },
};
export const IconLg: Story = {
  args: { size: "icon-lg", "aria-label": "Next page", children: <ArrowRightIcon /> },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../Badge";

const meta: Meta<typeof Badge> = {
  title: "shadcn-alexgorbatchev/components/Badge",
  component: Badge,
  tags: ["autodocs", "!test"],
  args: { children: "Active" },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Link: Story = { args: { variant: "link" } };
export const AsLink: Story = {
  args: { render: <a href="https://base-ui.com/" />, children: "Base UI", variant: "link" },
};

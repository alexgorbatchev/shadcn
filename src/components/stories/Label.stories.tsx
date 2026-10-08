import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../Label";
import { Input } from "../Input";

const meta: Meta<typeof Label> = {
  title: "shadcn-alexgorbatchev/components/Label",
  component: Label,
  tags: ["autodocs", "!test"],
  args: { children: "Email address" },
  render: (args) => {
    const storyId = useId();
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${storyId}-label-email`} {...args} />
        <Input id={`${storyId}-label-email`} type="email" placeholder="alex@example.com" />
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = {
  render: () => {
    const storyId = useId();
    return (
      <div data-disabled="true" className="flex flex-col gap-2">
        <Label htmlFor={`${storyId}-label-disabled`}>Email address</Label>
        <Input id={`${storyId}-label-disabled`} disabled />
      </div>
    );
  },
};

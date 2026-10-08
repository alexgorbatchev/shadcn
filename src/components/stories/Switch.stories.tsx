import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "../Switch";
import { Field, FieldLabel } from "../Field";
import { fn } from "storybook/test";

const meta: Meta<typeof Switch> = {
  title: "shadcn-alexgorbatchev/components/Switch",
  component: Switch,
  tags: ["autodocs", "!test"],
  args: { onCheckedChange: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <Field orientation="horizontal" data-disabled={args.disabled}>
        <Switch id={`${storyId}-switch-demo`} {...args} />
        <FieldLabel htmlFor={`${storyId}-switch-demo`}>Enable notifications</FieldLabel>
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const Small: Story = { args: { size: "sm" } };

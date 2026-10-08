import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "../Checkbox";
import { Field, FieldLabel } from "../Field";
import { fn } from "storybook/test";

const meta: Meta<typeof Checkbox> = {
  title: "shadcn-alexgorbatchev/components/Checkbox",
  component: Checkbox,
  tags: ["autodocs", "!test"],
  args: { onCheckedChange: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <Field orientation="horizontal" data-disabled={args.disabled}>
        <Checkbox id={`${storyId}-checkbox-demo`} {...args} />
        <FieldLabel htmlFor={`${storyId}-checkbox-demo`}>Enable notifications</FieldLabel>
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
export const Indeterminate: Story = { args: { indeterminate: true } };

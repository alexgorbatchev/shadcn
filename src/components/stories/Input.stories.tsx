import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../Input";
import { Field, FieldLabel, FieldDescription, FieldError } from "../Field";

const meta: Meta<typeof Input> = {
  title: "shadcn-alexgorbatchev/components/Input",
  component: Input,
  tags: ["autodocs", "!test"],
  args: { placeholder: "alex@example.com" },
  render: (args) => {
    const storyId = useId();
    return (
      <Field data-invalid={args["aria-invalid"]} data-disabled={args.disabled}>
        <FieldLabel htmlFor={`${storyId}-input-demo`}>Email</FieldLabel>
        <Input id={`${storyId}-input-demo`} aria-describedby={`${storyId}-input-help`} {...args} />
        <FieldDescription id={`${storyId}-input-help`}>Used for account notifications.</FieldDescription>
        {args["aria-invalid"] && <FieldError>Check this value.</FieldError>}
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "alex@example.com" } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "Read only value" } };
export const Password: Story = { args: { type: "password", placeholder: "Password" } };
export const FileUpload: Story = { args: { type: "file", placeholder: undefined } };

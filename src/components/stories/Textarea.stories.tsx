import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "../Textarea";
import { Field, FieldLabel, FieldDescription, FieldError } from "../Field";

const meta: Meta<typeof Textarea> = {
  title: "shadcn-alexgorbatchev/components/Textarea",
  component: Textarea,
  tags: ["autodocs", "!test"],
  args: { placeholder: "Describe your project" },
  render: (args) => {
    const storyId = useId();
    return (
      <Field data-invalid={args["aria-invalid"]} data-disabled={args.disabled}>
        <FieldLabel htmlFor={`${storyId}-textarea-demo`}>Description</FieldLabel>
        <Textarea id={`${storyId}-textarea-demo`} aria-describedby={`${storyId}-textarea-help`} {...args} />
        <FieldDescription id={`${storyId}-textarea-help`}>Optional notes for your team.</FieldDescription>
        {args["aria-invalid"] && <FieldError>Check this value.</FieldError>}
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "Build a shared design system." } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "Read only value" } };
export const MultipleRows: Story = {
  args: { rows: 5, defaultValue: "First line\nSecond line\nThird line" },
};

import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "../RadioGroup";
import { Field, FieldLabel, FieldSet, FieldLegend } from "../Field";
import { fn } from "storybook/test";

const meta: Meta<typeof RadioGroup> = {
  title: "shadcn-alexgorbatchev/components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs", "!test"],
  args: { defaultValue: "daily", onValueChange: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <FieldSet>
        <FieldLegend>Update frequency</FieldLegend>
        <RadioGroup aria-label="Update frequency" {...args}>
          <Field orientation="horizontal">
            <RadioGroupItem value="daily" id={`${storyId}-frequency-daily`} />
            <FieldLabel htmlFor={`${storyId}-frequency-daily`}>Daily</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="weekly" id={`${storyId}-frequency-weekly`} />
            <FieldLabel htmlFor={`${storyId}-frequency-weekly`}>Weekly</FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Weekly: Story = { args: { defaultValue: "weekly" } };
export const Unselected: Story = { args: { defaultValue: undefined } };
export const Disabled: Story = { args: { disabled: true } };

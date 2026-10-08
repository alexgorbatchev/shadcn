import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
} from "../Field";
import { Input } from "../Input";
import { Checkbox } from "../Checkbox";

const meta: Meta<typeof Field> = {
  title: "shadcn-alexgorbatchev/components/Field",
  component: Field,
  tags: ["autodocs", "!test"],
  args: { orientation: "vertical" },
  render: (args) => {
    const storyId = useId();
    return (
      <Field {...args}>
        <FieldLabel htmlFor={`${storyId}-field-name`}>Project name</FieldLabel>
        <Input id={`${storyId}-field-name`} defaultValue="my-project" />
        <FieldDescription>Choose a recognizable name.</FieldDescription>
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Responsive: Story = { args: { orientation: "responsive" } };
export const Invalid: Story = {
  render: () => {
    const storyId = useId();
    return (
      <Field data-invalid>
        <FieldLabel htmlFor={`${storyId}-invalid-name`}>Project name</FieldLabel>
        <Input
          id={`${storyId}-invalid-name`}
          aria-invalid
          aria-describedby={`${storyId}-invalid-message`}
          defaultValue=""
        />
        <FieldError id={`${storyId}-invalid-message`}>A project name is required.</FieldError>
      </Field>
    );
  },
};
export const Disabled: Story = {
  render: () => {
    const storyId = useId();
    return (
      <Field data-disabled>
        <FieldLabel htmlFor={`${storyId}-disabled-name`}>Project name</FieldLabel>
        <Input id={`${storyId}-disabled-name`} disabled defaultValue="my-project" />
      </Field>
    );
  },
};
export const Grouped: Story = {
  render: () => {
    const storyId = useId();
    return (
      <FieldSet>
        <FieldLegend>Notifications</FieldLegend>
        <FieldDescription>Select delivery channels.</FieldDescription>
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox id={`${storyId}-notify-email`} defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor={`${storyId}-notify-email`}>Email</FieldLabel>
              <FieldDescription>Weekly updates.</FieldDescription>
            </FieldContent>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field orientation="horizontal">
            <Checkbox id={`${storyId}-notify-desktop`} />
            <FieldLabel htmlFor={`${storyId}-notify-desktop`}>Desktop</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    );
  },
};
export const MultipleErrors: Story = {
  render: () => (
    <Field data-invalid>
      <FieldTitle>Validation</FieldTitle>
      <FieldError
        errors={[{ message: "Required field." }, { message: "Invalid format." }, { message: "Required field." }]}
      />
    </Field>
  ),
};

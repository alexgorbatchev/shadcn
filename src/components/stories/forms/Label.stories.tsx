import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Label } from "../../Label";
import { Input } from "../../Input";
import { Checkbox } from "../../Checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../../Field";
import { Button } from "../../Button";

const meta: Meta<typeof Label> = {
  title: "@alexgorbatchev/shadcn/components/forms/Label",
  component: Label,
  tags: ["autodocs", "test"],
  args: { children: "Email address", ref: fn(), onClick: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <FieldGroup>
        <Field>
          <Label htmlFor={`${storyId}-label-email`} {...args} />
          <Input id={`${storyId}-label-email`} type="email" placeholder="alex@example.com" />
        </Field>
      </FieldGroup>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Email address");
    const input = canvas.getByRole("textbox", { name: "Email address" });
    await expect(label.tagName).toBe("LABEL");
    await expect(args.ref).toHaveBeenCalledWith(label);
    await userEvent.click(label);
    await expect(input).toHaveFocus();
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.type(input, "alex@example.com");
    await expect(input).toHaveValue("alex@example.com");
  },
};
export const Disabled: Story = {
  render: () => {
    const storyId = useId();
    return (
      <FieldGroup>
        <Field data-disabled="true" className="group">
          <Label htmlFor={`${storyId}-label-disabled`}>Email address</Label>
          <Input id={`${storyId}-label-disabled`} disabled />
        </Field>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Email address" });
    const label = canvas.getByText("Email address");
    await expect(input).toBeDisabled();
    await expect(Number.parseFloat(getComputedStyle(label).opacity)).toBeLessThan(1);
    await expect(getComputedStyle(label).pointerEvents).toBe("none");
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};

export const ImplicitAssociation: Story = {
  render: (args) => (
    <FieldGroup>
      <Field>
        <Label {...args}>
          <span>Email address</span>
          <Input type="email" />
        </Label>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Email address" });
    await userEvent.click(canvas.getByText("Email address"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "blair@example.com");
    await expect(input).toHaveValue("blair@example.com");
  },
};

export const CheckboxAssociation: Story = {
  render: (args) => {
    const storyId = useId();
    return (
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id={`${storyId}-updates`} />
          <Label {...args} htmlFor={`${storyId}-updates`}>
            Send project updates
          </Label>
        </Field>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Send project updates" });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(canvas.getByText("Send project updates"));
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

export const DisabledPeer: Story = {
  render: (args) => {
    const storyId = useId();
    return (
      <FieldGroup>
        <Field>
          <Input id={`${storyId}-peer`} className="peer" disabled />
          <Label {...args} htmlFor={`${storyId}-peer`}>
            Email address
          </Label>
          <Button>Next field</Button>
        </Field>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Email address" });
    const label = canvas.getByText("Email address");
    await expect(input).toBeDisabled();
    await expect(Number.parseFloat(getComputedStyle(label).opacity)).toBeLessThan(1);
    await expect(getComputedStyle(label).cursor).toBe("not-allowed");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Next field" })).toHaveFocus();
  },
};

export const Compact: Story = { ...Default, args: { density: "compact" } };
export const RightToLeft: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const InField: Story = {
  render: function Render() {
    const id = useId();
    return (
      <FieldGroup className="w-80">
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>Contact email</FieldLabel>
          <Input id={`${id}-email`} type="email" aria-describedby={`${id}-help`} />
          <FieldDescription id={`${id}-help`}>For project updates.</FieldDescription>
        </Field>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Contact email" });
    await expect(input).toHaveAccessibleDescription("For project updates.");
    await userEvent.click(canvas.getByText("Contact email"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "alex@example.com");
    await expect(input).toHaveValue("alex@example.com");
  },
};
export const RightToLeftField: Story = {
  ...InField,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async (context) => {
    const description = within(context.canvasElement).getByText("For project updates.");
    const range = document.createRange();
    range.selectNodeContents(description);
    await expect(range.getBoundingClientRect().right).toBeCloseTo(description.getBoundingClientRect().right, 1);
    await InField.play?.(context);
  },
};

import { useId, useState } from "react";
import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "../RadioGroup";
import { Field, FieldContent, FieldLabel, FieldSet, FieldLegend, FieldDescription, FieldError } from "../Field";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { expect, fn, waitFor, within } from "storybook/test";

type FrequencyOptionsProps = Omit<ComponentProps<typeof RadioGroupItem>, "value" | "id">;

function FrequencyOptions(props: FrequencyOptionsProps): ReactElement {
  const storyId = useId();
  return (
    <>
      <Field orientation="horizontal" data-disabled={props.disabled}>
        <RadioGroupItem {...props} value="daily" id={`${storyId}-frequency-daily`} />
        <FieldLabel htmlFor={`${storyId}-frequency-daily`}>Daily</FieldLabel>
      </Field>
      <Field orientation="horizontal" data-disabled={props.disabled}>
        <RadioGroupItem {...props} value="weekly" id={`${storyId}-frequency-weekly`} />
        <FieldLabel htmlFor={`${storyId}-frequency-weekly`}>Weekly</FieldLabel>
      </Field>
    </>
  );
}

const meta: Meta<typeof RadioGroup> = {
  title: "shadcn-alexgorbatchev/components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs", "test"],
  args: { defaultValue: "daily", onValueChange: fn() },
  render: (args) => {
    return (
      <FieldSet>
        <FieldLegend>Update frequency</FieldLegend>
        <RadioGroup aria-label="Update frequency" {...args}>
          <FrequencyOptions disabled={args.disabled} />
        </RadioGroup>
      </FieldSet>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const daily = canvas.getByRole("radio", { name: "Daily" });
    const weekly = canvas.getByRole("radio", { name: "Weekly" });
    await expect(daily).toBeChecked();
    await userEvent.click(canvas.getByText("Weekly"));
    await expect(weekly).toBeChecked();
    await expect(daily).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("weekly", expect.objectContaining({ reason: "none" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(daily).toHaveFocus();
    await expect(daily).toBeChecked();
    await userEvent.keyboard("{ArrowUp}");
    await expect(weekly).toBeChecked();
  },
};
export const Weekly: Story = {
  args: { defaultValue: "weekly" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Daily" }));
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
  },
};
export const Unselected: Story = {
  args: { defaultValue: undefined },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const daily = canvas.getByRole("radio", { name: "Daily" });
    await expect(daily).not.toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Weekly" })).not.toBeChecked();
    await userEvent.tab();
    await expect(daily).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(daily).not.toBeChecked();
    await userEvent.keyboard(" ");
    await expect(daily).toBeChecked();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const weekly = canvas.getByRole("radio", { name: "Weekly" });
    await expect(canvas.getByRole("radiogroup", { name: "Update frequency" })).toHaveAttribute("aria-disabled", "true");
    await expect(weekly).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(weekly);
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(weekly).not.toHaveFocus();
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radiogroup")).toHaveAttribute("aria-readonly", "true");
    await userEvent.click(canvas.getByRole("radio", { name: "Weekly" }));
    await userEvent.keyboard("{ArrowDown} ");
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
export const DisabledItem: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <FieldSet>
        <FieldLegend>Update frequency</FieldLegend>
        <RadioGroup {...args} aria-label="Update frequency">
          <Field orientation="horizontal">
            <RadioGroupItem value="daily" id={id + "-daily"} />
            <FieldLabel htmlFor={id + "-daily"}>Daily</FieldLabel>
          </Field>
          <Field data-disabled orientation="horizontal">
            <RadioGroupItem value="weekly" id={id + "-weekly"} disabled />
            <FieldLabel htmlFor={id + "-weekly"}>Weekly</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="monthly" id={id + "-monthly"} />
            <FieldLabel htmlFor={id + "-monthly"}>Monthly</FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const weekly = canvas.getByRole("radio", { name: "Weekly" });
    await userEvent.click(weekly);
    await expect(weekly).not.toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Daily" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toHaveFocus();
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("daily");
    return (
      <FieldSet>
        <FieldLegend>Controlled frequency</FieldLegend>
        <RadioGroup {...args} aria-label="Controlled frequency" value={value} onValueChange={setValue}>
          <FrequencyOptions />
        </RadioGroup>
        <output aria-label="Frequency preference">{value}</output>
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Weekly" }));
    await expect(canvas.getByRole("status", { name: "Frequency preference" })).toHaveTextContent("weekly");
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("status", { name: "Frequency preference" })).toHaveTextContent("daily");
  },
};
export const NativeGroupCallback: Story = {
  args: { disabled: true, className: (state) => (state.disabled ? "gap-6" : "gap-2") },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("radiogroup");
    await expect(getComputedStyle(group).rowGap).toBe("24px");
  },
};
export const NativeItemCallback: Story = {
  render: (args) => (
    <FieldSet>
      <FieldLegend>Update frequency</FieldLegend>
      <RadioGroup {...args} aria-label="Update frequency">
        <FrequencyOptions className={(state) => (state.checked ? "size-8" : "size-6")} />
      </RadioGroup>
    </FieldSet>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const weekly = within(canvasElement).getByRole("radio", { name: "Weekly" });
    await expect(weekly.getBoundingClientRect().height).toBe(24);
    await userEvent.click(weekly);
    await waitFor(() => expect(weekly.getBoundingClientRect().height).toBe(32));
  },
};
export const NativeStyleCallback: Story = {
  render: (args) => (
    <FieldSet>
      <FieldLegend>Update frequency</FieldLegend>
      <RadioGroup {...args} aria-label="Update frequency">
        <FrequencyOptions style={(state) => ({ height: state.checked ? 32 : 24 })} />
      </RadioGroup>
    </FieldSet>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const weekly = within(canvasElement).getByRole("radio", { name: "Weekly" });
    await expect(weekly.getBoundingClientRect().height).toBe(24);
    await userEvent.click(weekly);
    await waitFor(() => expect(weekly.getBoundingClientRect().height).toBe(32));
  },
};
export const CancelledChange: Story = {
  args: { onValueChange: (_value, details) => details.cancel() },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Weekly" }));
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Weekly" })).not.toBeChecked();
  },
};
export const NativeButton: Story = {
  ...Default,
  render: (args) => (
    <FieldSet>
      <FieldLegend>Update frequency</FieldLegend>
      <RadioGroup {...args} aria-label="Update frequency">
        <FrequencyOptions nativeButton render={<button type="button" />} />
      </RadioGroup>
    </FieldSet>
  ),
  play: async (context) => {
    await Default.play?.(context);
    const daily = within(context.canvasElement).getByRole("radio", { name: "Daily" });
    await expect(daily.tagName).toBe("BUTTON");
    await expect(daily).toHaveAttribute("type", "button");
  },
};
export const RightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <FieldSet dir="rtl">
        <FieldLegend>Update frequency</FieldLegend>
        <RadioGroup {...args} aria-label="Update frequency">
          <FrequencyOptions />
        </RadioGroup>
      </FieldSet>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Daily" }));
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toBeChecked();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
  },
};
export const RequiredForm: Story = {
  args: { defaultValue: undefined, required: true, name: "frequency" },
  render: function Render(args) {
    const [result, setResult] = useState("");
    const [value, setValue] = useState<string | null>(null);
    return (
      <form
        aria-label="Frequency form"
        onReset={() => setValue(null)}
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <FieldSet>
          <FieldLegend>Update frequency</FieldLegend>
          <RadioGroup {...args} aria-label="Update frequency" value={value} onValueChange={setValue}>
            <FrequencyOptions />
          </RadioGroup>
          <Field orientation="horizontal">
            <Button type="submit">Save frequency</Button>
            <Button type="reset">Reset frequency</Button>
          </Field>
        </FieldSet>
        <output aria-label="Saved frequency">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Frequency form" }) as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await expect(canvas.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Save frequency" }));
    await expect(canvas.getByRole("status", { name: "Saved frequency" })).toBeEmptyDOMElement();
    await userEvent.click(canvas.getByRole("radio", { name: "Weekly" }));
    await expect(form.checkValidity()).toBe(true);
    await userEvent.click(canvas.getByRole("button", { name: "Save frequency" }));
    await expect(canvas.getByRole("status", { name: "Saved frequency" })).toHaveTextContent('{"frequency":"weekly"}');
    await userEvent.click(canvas.getByRole("button", { name: "Reset frequency" }));
    await expect(canvas.getByRole("radio", { name: "Weekly" })).not.toBeChecked();
    await expect(form.checkValidity()).toBe(false);
  },
};
export const ExternalFormAndRefs: Story = {
  args: { inputRef: fn(), ref: fn() },
  render: function Render(args) {
    const formId = useId();
    const [result, setResult] = useState("");
    return (
      <FieldSet>
        <FieldLegend>Update frequency</FieldLegend>
        <form
          id={formId}
          aria-label="External frequency form"
          onSubmit={(event) => {
            event.preventDefault();
            setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
          }}
        >
          <Button type="submit">Save external frequency</Button>
          <output aria-label="Saved external frequency">{result}</output>
        </form>
        <RadioGroup {...args} name="frequency" form={formId} aria-label="Update frequency">
          <FrequencyOptions />
        </RadioGroup>
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup");
    await expect(args.ref).toHaveBeenCalledWith(group);
    await userEvent.click(canvas.getByRole("radio", { name: "Weekly" }));
    const input = group.querySelector('input[type="radio"][value="weekly"]');
    await expect(input).toBeChecked();
    await waitFor(() => expect(args.inputRef).toHaveBeenLastCalledWith(input));
    await userEvent.click(canvas.getByRole("button", { name: "Save external frequency" }));
    await expect(canvas.getByRole("status", { name: "Saved external frequency" })).toHaveTextContent(
      '{"frequency":"weekly"}',
    );
  },
};

export const WithDescription: Story = {
  args: { defaultValue: "email" },
  render: function Render(args) {
    const id = useId();
    const isInvalid = Boolean(args["aria-invalid"]);
    return (
      <FieldSet className="w-80" aria-describedby={id + "-help"}>
        <FieldLegend id={id + "-legend"} variant="label">
          Notification delivery
        </FieldLegend>
        <FieldDescription id={id + "-help"}>Choose how to receive project updates.</FieldDescription>
        <RadioGroup {...args} aria-labelledby={id + "-legend"} aria-describedby={id + "-help"}>
          <Field orientation="horizontal" data-invalid={isInvalid}>
            <RadioGroupItem
              id={id + "-email"}
              value="email"
              aria-invalid={isInvalid}
              aria-describedby={id + "-email-help"}
              aria-errormessage={isInvalid ? id + "-error" : undefined}
            />
            <FieldContent>
              <FieldLabel htmlFor={id + "-email"}>Email</FieldLabel>
              <FieldDescription id={id + "-email-help"}>Receive email updates.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal" data-invalid={isInvalid}>
            <RadioGroupItem
              id={id + "-sms"}
              value="sms"
              aria-invalid={isInvalid}
              aria-describedby={id + "-sms-help"}
              aria-errormessage={isInvalid ? id + "-error" : undefined}
            />
            <FieldContent>
              <FieldLabel htmlFor={id + "-sms"}>Text message</FieldLabel>
              <FieldDescription id={id + "-sms-help"}>Receive mobile updates.</FieldDescription>
            </FieldContent>
          </Field>
        </RadioGroup>
        {isInvalid && <FieldError id={id + "-error"}>Choose an available delivery method.</FieldError>}
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Notification delivery" })).toHaveAccessibleDescription(
      "Choose how to receive project updates.",
    );
    await expect(canvas.getByRole("radiogroup", { name: "Notification delivery" })).toHaveAccessibleDescription(
      "Choose how to receive project updates.",
    );
    const email = canvas.getByRole("radio", { name: "Email" });
    const sms = canvas.getByRole("radio", { name: "Text message" });
    await expect(email).toHaveAccessibleDescription("Receive email updates.");
    await expect(sms).toHaveAccessibleDescription("Receive mobile updates.");
    await userEvent.click(canvas.getByText("Text message"));
    await expect(sms).toBeChecked();
    await expect(email).not.toBeChecked();
    await expect(sms).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("sms", expect.objectContaining({ reason: "none" }));
    await userEvent.keyboard("{ArrowUp}");
    await expect(email).toBeChecked();
    await expect(email).toHaveFocus();
    await expect(sms).not.toBeChecked();
  },
};

export const RightToLeftDescription: Story = {
  ...WithDescription,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    await WithDescription.play?.(context);
    const canvas = within(context.canvasElement);
    const control = canvas.getByRole("radio", { name: "Email" });
    const label = canvas.getByText("Email");
    await expect(control.getBoundingClientRect().left).toBeGreaterThanOrEqual(label.getBoundingClientRect().right);
    const description = canvas.getByText("Receive email updates.");
    const range = description.ownerDocument.createRange();
    range.selectNodeContents(description);
    await expect(
      Math.abs(range.getBoundingClientRect().right - description.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);
  },
};

export const Invalid: Story = {
  ...WithDescription,
  args: { defaultValue: "email", "aria-invalid": true },
  play: async (context) => {
    await WithDescription.play?.(context);
    const canvas = within(context.canvasElement);
    await expect(canvas.getByRole("radio", { name: "Email" })).toHaveAccessibleErrorMessage(
      "Choose an available delivery method.",
    );
    await expect(canvas.getByRole("radio", { name: "Text message" })).toHaveAccessibleErrorMessage(
      "Choose an available delivery method.",
    );
    await expect(getComputedStyle(canvas.getByText("Email")).color).toBe(
      getComputedStyle(canvas.getByRole("alert")).color,
    );
    await expect(getComputedStyle(canvas.getByText("Text message")).color).toBe(
      getComputedStyle(canvas.getByRole("alert")).color,
    );
  },
};

export const RightToLeftInvalid: Story = {
  ...Invalid,
  decorators: RightToLeftDescription.decorators,
};

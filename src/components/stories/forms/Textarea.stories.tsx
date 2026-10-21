import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "../../Textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "../../Field";
import { Button } from "../../Button";
import { expect, fn, within } from "storybook/test";

const meta: Meta<typeof Textarea> = {
  title: "@alexgorbatchev/shadcn/components/forms/Textarea",
  component: Textarea,
  tags: ["autodocs", "test"],
  args: { placeholder: "Describe your project", onChange: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <Field data-invalid={args["aria-invalid"]} data-disabled={args.disabled}>
        <FieldLabel htmlFor={`${storyId}-textarea-demo`}>Description</FieldLabel>
        <Textarea
          id={`${storyId}-textarea-demo`}
          aria-describedby={`${storyId}-textarea-help`}
          aria-errormessage={args["aria-invalid"] ? `${storyId}-textarea-error` : undefined}
          {...args}
        />
        <FieldDescription id={`${storyId}-textarea-help`}>Optional notes for your team.</FieldDescription>
        {args["aria-invalid"] && <FieldError id={`${storyId}-textarea-error`}>Check this value.</FieldError>}
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Description" });
    await userEvent.click(canvas.getByText("Description"));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription("Optional notes for your team.");
    await userEvent.type(input, "First line{Enter}Second line");
    await expect(input).toHaveValue("First line\nSecond line");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
export const Filled: Story = {
  args: { defaultValue: "Build a shared design system." },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Description" });
    await expect(input).toHaveValue("Build a shared design system.");
    await userEvent.clear(input);
    await userEvent.type(input, "Updated description");
    await expect(input).toHaveValue("Updated description");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Description" });
    await expect(input).toBeDisabled();
    await userEvent.type(input, "ignored");
    await expect(input).toHaveValue("");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};
export const Invalid: Story = {
  ...Default,
  args: { "aria-invalid": true },
  play: async (context) => {
    await Default.play?.(context);
    const canvas = within(context.canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Description" })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Check this value.");
    await expect(canvas.getByRole("textbox", { name: "Description" })).toHaveAccessibleErrorMessage(
      "Check this value.",
    );
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "Read only value" },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Description" });
    await userEvent.type(input, "ignored");
    await expect(input).toHaveValue("Read only value");
    await expect(input).toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const MultipleRows: Story = {
  args: { rows: 5, defaultValue: "First line\nSecond line\nThird line" },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Description" });
    await expect(input).toHaveValue("First line\nSecond line\nThird line");
    await userEvent.click(input);
    await userEvent.keyboard("{Control>}{End}{/Control}{Enter}Fourth line");
    await expect(input).toHaveValue("First line\nSecond line\nThird line\nFourth line");
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <Field>
        <Textarea
          {...args}
          aria-label="Controlled description"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        <output aria-label="Current description">{value}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Controlled description" }), "Project notes");
    await expect(canvas.getByRole("status", { name: "Current description" })).toHaveTextContent("Project notes");
  },
};
export const AutoSize: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Description" });
    const initialHeight = input.getBoundingClientRect().height;
    await userEvent.type(
      input,
      "One{Enter}Two{Enter}Three{Enter}Four{Enter}Five{Enter}Six{Enter}Seven{Enter}Eight{Enter}Nine{Enter}Ten",
    );
    await expect(input.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
    await userEvent.clear(input);
    await expect(input.getBoundingClientRect().height).toBe(initialHeight);
  },
};
export const NativeRef: Story = {
  args: { ref: fn() },
  play: async ({ canvasElement, args }) => {
    await expect(args.ref).toHaveBeenCalledWith(within(canvasElement).getByRole("textbox", { name: "Description" }));
  },
};
export const MaxLength: Story = {
  args: { maxLength: 5 },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Description" });
    await userEvent.type(input, "123456789");
    await expect(input).toHaveValue("12345");
  },
};
export const RightToLeft: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async (context) => {
    const description = within(context.canvasElement).getByText("Optional notes for your team.");
    const range = document.createRange();
    range.selectNodeContents(description);
    await expect(range.getBoundingClientRect().right).toBeCloseTo(description.getBoundingClientRect().right, 1);
    await Default.play?.(context);
  },
};
export const WithSubmitButton: Story = {
  render: function Render(args) {
    const id = useId();
    const [message, setMessage] = useState("");
    return (
      <form
        aria-label="Message form"
        className="w-80"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(String(new FormData(event.currentTarget).get("message")));
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-message`}>Message</FieldLabel>
            <Textarea {...args} id={`${id}-message`} name="message" required aria-describedby={`${id}-help`} />
            <FieldDescription id={`${id}-help`}>Share an update with your team.</FieldDescription>
          </Field>
          <Button type="submit">Send message</Button>
          <output aria-label="Sent message">{message}</output>
        </FieldGroup>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(input.checkValidity()).toBe(false);
    await expect(canvas.getByRole("status", { name: "Sent message" })).toHaveTextContent("");
    await userEvent.type(input, "First line{Enter}Second line");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Send message" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Sent message" })).toHaveTextContent("First line Second line");
    await expect(input).toHaveAccessibleDescription("Share an update with your team.");
  },
};
export const RightToLeftSubmitButton: Story = {
  ...WithSubmitButton,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const FormSubmissionAndReset: Story = {
  render: function Render(args) {
    const [result, setResult] = useState("");
    return (
      <form
        aria-label="Notes form"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <Field>
          <Textarea {...args} name="notes" aria-label="Project notes" defaultValue="Initial notes" required />
          <Textarea name="omitted" aria-label="Disabled notes" disabled defaultValue="hidden" />
          <Button type="submit">Save notes</Button>
          <Button type="reset">Reset notes</Button>
        </Field>
        <output aria-label="Saved notes">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Project notes" }) as HTMLTextAreaElement;
    await userEvent.clear(input);
    await expect(input.checkValidity()).toBe(false);
    await userEvent.type(input, "Updated notes");
    await userEvent.click(canvas.getByRole("button", { name: "Save notes" }));
    await expect(canvas.getByRole("status", { name: "Saved notes" })).toHaveTextContent('{"notes":"Updated notes"}');
    await userEvent.click(canvas.getByRole("button", { name: "Reset notes" }));
    await expect(input).toHaveValue("Initial notes");
    await expect(input.checkValidity()).toBe(true);
  },
};

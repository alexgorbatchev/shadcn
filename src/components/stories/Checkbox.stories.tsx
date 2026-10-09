import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "../Checkbox";
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError } from "../Field";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { expect, fn, within } from "storybook/test";

const meta: Meta<typeof Checkbox> = {
  title: "shadcn-alexgorbatchev/components/Checkbox",
  component: Checkbox,
  tags: ["autodocs", "test"],
  args: { onCheckedChange: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <Field orientation="horizontal" data-disabled={args.disabled} data-invalid={args["aria-invalid"]}>
        <Checkbox
          id={`${storyId}-checkbox-demo`}
          aria-errormessage={args["aria-invalid"] ? `${storyId}-error` : undefined}
          {...args}
        />
        <FieldContent>
          <FieldLabel htmlFor={`${storyId}-checkbox-demo`}>Enable notifications</FieldLabel>
          {args["aria-invalid"] && <FieldError id={`${storyId}-error`}>Choose a notification preference.</FieldError>}
        </FieldContent>
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Enable notifications" });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(canvas.getByText("Enable notifications"));
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: "none" }));
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};
export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvasElement, userEvent }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await expect(checkbox).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(checkbox).not.toHaveFocus();
  },
};
export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
export const Invalid: Story = {
  ...Unchecked,
  args: { "aria-invalid": true },
  play: async (context) => {
    await Unchecked.play?.(context);
    await expect(within(context.canvasElement).getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    const canvas = within(context.canvasElement);
    await expect(canvas.getByRole("checkbox")).toHaveAccessibleErrorMessage("Choose a notification preference.");
    await expect(getComputedStyle(canvas.getByText("Enable notifications")).color).toBe(
      getComputedStyle(canvas.getByRole("alert")).color,
    );
  },
};
export const Indeterminate: Story = {
  args: { indeterminate: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await expect(checkbox).toBePartiallyChecked();
    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: "none" }));
    await expect(checkbox).toBePartiallyChecked();
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await userEvent.click(checkbox);
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute("aria-readonly", "true");
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [isChecked, setIsChecked] = useState(false);
    return (
      <Field orientation="horizontal">
        <Checkbox {...args} aria-label="Controlled notifications" checked={isChecked} onCheckedChange={setIsChecked} />
        <output aria-label="Notification preference">{String(isChecked)}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Controlled notifications" });
    await userEvent.click(checkbox);
    await expect(canvas.getByRole("status", { name: "Notification preference" })).toHaveTextContent("true");
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("status", { name: "Notification preference" })).toHaveTextContent("false");
  },
};
export const NativeCallbacks: Story = {
  args: { className: (state) => (state.checked ? "size-8" : "size-6") },
  play: async ({ canvasElement, userEvent }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await expect(checkbox.getBoundingClientRect().height).toBe(24);
    await userEvent.click(checkbox);
    await expect(checkbox.getBoundingClientRect().height).toBe(32);
  },
};
export const CancelledChange: Story = {
  args: { onCheckedChange: (_checked, details) => details.cancel() },
  play: async ({ canvasElement, userEvent }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};
export const NativeButton: Story = {
  ...Unchecked,
  args: { nativeButton: true, render: <button type="button" /> },
  play: async (context) => {
    await Unchecked.play?.(context);
    const checkbox = within(context.canvasElement).getByRole("checkbox", { name: "Enable notifications" });
    await expect(checkbox.tagName).toBe("BUTTON");
    await expect(checkbox).toHaveAttribute("type", "button");
  },
};
export const FormSubmission: Story = {
  render: function Render(args) {
    const [result, setResult] = useState("");
    const [isChecked, setIsChecked] = useState(true);
    return (
      <form
        aria-label="Notification form"
        onReset={() => setIsChecked(true)}
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <Checkbox
          {...args}
          aria-label="Submit notifications"
          name="notifications"
          value="enabled"
          checked={isChecked}
          onCheckedChange={setIsChecked}
        />
        <Checkbox aria-label="Unchecked option" name="omitted" />
        <Checkbox aria-label="Explicit unchecked value" name="fallback" uncheckedValue="off" />
        <Button type="submit">Save preferences</Button>
        <Button type="reset">Reset preferences</Button>
        <output aria-label="Submitted preferences">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Submit notifications" });
    await userEvent.click(canvas.getByRole("button", { name: "Save preferences" }));
    await expect(canvas.getByRole("status", { name: "Submitted preferences" })).toHaveTextContent(
      '{"notifications":"enabled","fallback":"off"}',
    );
    await userEvent.click(checkbox);
    await userEvent.click(canvas.getByRole("button", { name: "Save preferences" }));
    await expect(canvas.getByRole("status", { name: "Submitted preferences" })).toHaveTextContent('{"fallback":"off"}');
    await userEvent.click(canvas.getByRole("button", { name: "Reset preferences" }));
    await expect(checkbox).toBeChecked();
  },
};

export const WithDescription: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field orientation="horizontal" className="w-80" data-disabled={args.disabled}>
        <Checkbox {...args} id={id} aria-describedby={id + "-help"} />
        <FieldContent>
          <FieldLabel htmlFor={id}>Accept project terms</FieldLabel>
          <FieldDescription id={id + "-help"}>Agree to the terms before sharing this project.</FieldDescription>
        </FieldContent>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("checkbox", { name: "Accept project terms" });
    await expect(control).toHaveAccessibleDescription("Agree to the terms before sharing this project.");
    await userEvent.click(canvas.getByText("Accept project terms"));
    await expect(control).toBeChecked();
    await expect(control).toHaveFocus();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: "none" }));
    await userEvent.keyboard(" ");
    await expect(control).not.toBeChecked();
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
    const control = canvas.getByRole("checkbox", { name: "Accept project terms" });
    const label = canvas.getByText("Accept project terms");
    await expect(control.getBoundingClientRect().left).toBeGreaterThanOrEqual(label.getBoundingClientRect().right);
    const description = canvas.getByText("Agree to the terms before sharing this project.");
    const range = description.ownerDocument.createRange();
    range.selectNodeContents(description);
    await expect(
      Math.abs(range.getBoundingClientRect().right - description.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);
  },
};

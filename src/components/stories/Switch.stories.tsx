import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "../Switch";
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError, FieldGroup } from "../Field";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { expect, fn, waitFor, within } from "storybook/test";

const meta: Meta<typeof Switch> = {
  title: "shadcn-alexgorbatchev/components/Switch",
  component: Switch,
  tags: ["autodocs", "test"],
  args: { onCheckedChange: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <Field orientation="horizontal" data-disabled={args.disabled} data-invalid={args["aria-invalid"]}>
        <Switch
          id={`${storyId}-switch-demo`}
          aria-errormessage={args["aria-invalid"] ? `${storyId}-error` : undefined}
          {...args}
        />
        <FieldContent>
          <FieldLabel htmlFor={`${storyId}-switch-demo`}>Enable notifications</FieldLabel>
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
    const checkbox = canvas.getByRole("switch", { name: "Enable notifications" });
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
    const checkbox = within(canvasElement).getByRole("switch", { name: "Enable notifications" });
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const checkbox = within(canvasElement).getByRole("switch", { name: "Enable notifications" });
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
    const checkbox = within(canvasElement).getByRole("switch", { name: "Enable notifications" });
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
    await expect(within(context.canvasElement).getByRole("switch")).toHaveAttribute("aria-invalid", "true");
    const canvas = within(context.canvasElement);
    await expect(canvas.getByRole("switch")).toHaveAccessibleErrorMessage("Choose a notification preference.");
    await expect(getComputedStyle(canvas.getByText("Enable notifications")).color).toBe(
      getComputedStyle(canvas.getByRole("alert")).color,
    );
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const checkbox = within(canvasElement).getByRole("switch", { name: "Enable notifications" });
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
        <Switch {...args} aria-label="Controlled notifications" checked={isChecked} onCheckedChange={setIsChecked} />
        <output aria-label="Notification preference">{String(isChecked)}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("switch", { name: "Controlled notifications" });
    await userEvent.click(checkbox);
    await expect(canvas.getByRole("status", { name: "Notification preference" })).toHaveTextContent("true");
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("status", { name: "Notification preference" })).toHaveTextContent("false");
  },
};
export const NativeCallbacks: Story = {
  args: { className: (state) => (state.checked ? "min-w-12" : "min-w-10") },
  play: async ({ canvasElement, userEvent }) => {
    const checkbox = within(canvasElement).getByRole("switch", { name: "Enable notifications" });
    await expect(checkbox.getBoundingClientRect().width).toBe(40);
    await userEvent.click(checkbox);
    await expect(checkbox.getBoundingClientRect().width).toBe(48);
  },
};
export const CancelledChange: Story = {
  args: { onCheckedChange: (_checked, details) => details.cancel() },
  play: async ({ canvasElement, userEvent }) => {
    const checkbox = within(canvasElement).getByRole("switch", { name: "Enable notifications" });
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};
export const NativeButton: Story = {
  ...Unchecked,
  args: { nativeButton: true, render: <button type="button" /> },
  play: async (context) => {
    await Unchecked.play?.(context);
    const checkbox = within(context.canvasElement).getByRole("switch", { name: "Enable notifications" });
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
        <Switch
          {...args}
          aria-label="Submit notifications"
          name="notifications"
          value="enabled"
          checked={isChecked}
          onCheckedChange={setIsChecked}
        />
        <Switch aria-label="Unchecked option" name="omitted" />
        <Switch aria-label="Explicit unchecked value" name="fallback" uncheckedValue="off" />
        <Button type="submit">Save preferences</Button>
        <Button type="reset">Reset preferences</Button>
        <output aria-label="Submitted preferences">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("switch", { name: "Submit notifications" });
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

export const Small: Story = { ...Unchecked, args: { size: "sm" } };
export const RightToLeft: Story = {
  args: { dir: "rtl" },
  play: async ({ canvasElement, userEvent }) => {
    const control = within(canvasElement).getByRole("switch", { name: "Enable notifications" });
    const thumb = control.querySelector("[data-slot=switch-thumb]");
    await expect(thumb).not.toBeNull();
    await expect(thumb?.getBoundingClientRect().right).toBeLessThanOrEqual(control.getBoundingClientRect().right);
    const uncheckedCenter =
      (thumb?.getBoundingClientRect().left ?? 0) + (thumb?.getBoundingClientRect().width ?? 0) / 2;
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await waitFor(() =>
      expect((thumb?.getBoundingClientRect().left ?? 0) + (thumb?.getBoundingClientRect().width ?? 0) / 2).toBeLessThan(
        uncheckedCenter,
      ),
    );
    await expect(thumb?.getBoundingClientRect().left).toBeGreaterThanOrEqual(control.getBoundingClientRect().left);
  },
};

export const WithDescription: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field orientation="horizontal" className="w-80" data-disabled={args.disabled}>
        <FieldContent>
          <FieldLabel htmlFor={id}>Share across devices</FieldLabel>
          <FieldDescription id={id + "-help"}>Keep project settings synchronized across your devices.</FieldDescription>
        </FieldContent>
        <Switch {...args} id={id} aria-describedby={id + "-help"} />
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Share across devices" });
    await expect(control).toHaveAccessibleDescription("Keep project settings synchronized across your devices.");
    await userEvent.click(canvas.getByText("Share across devices"));
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
    const control = canvas.getByRole("switch", { name: "Share across devices" });
    const label = canvas.getByText("Share across devices");
    await expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(label.getBoundingClientRect().left);
    const description = canvas.getByText("Keep project settings synchronized across your devices.");
    const range = description.ownerDocument.createRange();
    range.selectNodeContents(description);
    await expect(
      Math.abs(range.getBoundingClientRect().right - description.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);
  },
};

export const Sizes: Story = {
  render: function Render() {
    const id = useId();
    return (
      <FieldGroup className="w-80">
        <Field orientation="horizontal">
          <Switch id={id + "-default"} />
          <FieldLabel htmlFor={id + "-default"}>Default switch</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Switch id={id + "-small"} size="sm" />
          <FieldLabel htmlFor={id + "-small"}>Small switch</FieldLabel>
        </Field>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const normal = canvas.getByRole("switch", { name: "Default switch" });
    const small = canvas.getByRole("switch", { name: "Small switch" });
    await expect(normal.getBoundingClientRect().width).toBeGreaterThan(small.getBoundingClientRect().width);
    await expect(normal.getBoundingClientRect().height).toBeGreaterThan(small.getBoundingClientRect().height);
    await userEvent.click(canvas.getByText("Default switch"));
    await expect(normal).toBeChecked();
    await userEvent.tab();
    await expect(small).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(small).toBeChecked();
    await expect(normal).toBeChecked();
  },
};

export const SmallRightToLeft: Story = { ...RightToLeft, args: { size: "sm", dir: "rtl" } };

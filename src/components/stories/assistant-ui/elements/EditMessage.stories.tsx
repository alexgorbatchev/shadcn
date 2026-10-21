import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { EditMessage } from "../../../assistant-ui/elements/EditMessage.js";
const meta: Meta<typeof EditMessage> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/EditMessage",
  component: EditMessage,
  tags: ["autodocs", "test"],
  args: {
    value: "Inspect the service",
    editing: false,
    discardedReplies: 2,
    onValueChange: fn(),
    onSave: fn(),
    onCancel: fn(),
    onStartEdit: fn(),
  },
  render: function Interactive(args) {
    const [editing, setEditing] = useState(args.editing);
    const [value, setValue] = useState(args.value);
    return (
      <EditMessage
        {...args}
        value={value}
        editing={editing}
        onValueChange={(next) => {
          args.onValueChange?.(next);
          setValue(next);
        }}
        onStartEdit={() => {
          args.onStartEdit?.();
          setEditing(true);
        }}
        onSave={() => {
          args.onSave?.();
          setEditing(false);
        }}
        onCancel={() => {
          args.onCancel?.();
          setValue(args.value);
          setEditing(false);
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const EditAndSave: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Inspect the service" }));
    const input = canvas.getByRole("textbox", { name: "Edit your message" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.clear(input);
    await userEvent.type(input, "Inspect recent logs");
    await expect(canvas.getByText("sending discards 2 replies")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(args.onSave).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Inspect recent logs" })).toHaveFocus());
  },
};
export const Cancel: Story = {
  args: { editing: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox"), " draft");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: "Inspect the service" })).toBeVisible();
  },
};
export const ReadOnly: Story = {
  args: { editing: true, onValueChange: undefined, onSave: undefined, onCancel: undefined },
  render: (args) => <EditMessage {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveAttribute("readonly");
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Cancel" })).toBeDisabled();
  },
};
export const Unavailable: Story = {
  args: { onStartEdit: undefined },
  render: (args) => <EditMessage {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};

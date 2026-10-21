import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ElicitationForm } from "../../../assistant-ui/elements/ElicitationForm.js";
const meta: Meta<typeof ElicitationForm> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ElicitationForm",
  component: ElicitationForm,
  tags: ["autodocs", "test"],
  args: {
    server: "Deployment service",
    message: "Choose deployment settings",
    state: "request",
    fields: [
      { name: "name", label: "Deployment name", kind: "text", value: "", required: true },
      {
        name: "environment",
        label: "Environment",
        kind: "choice",
        value: "Staging",
        options: ["Staging", "Production"],
        required: true,
      },
      { name: "remember", label: "Remember settings", kind: "toggle", value: "false" },
    ],
    onFieldChange: fn(),
    onAccept: fn(),
    onDecline: fn(),
  },
  render: function Interactive(args) {
    const [fields, setFields] = useState(args.fields);
    const [state, setState] = useState(args.state);
    return (
      <ElicitationForm
        {...args}
        fields={fields}
        state={state}
        onFieldChange={(name, value) => {
          args.onFieldChange?.(name, value);
          setFields((current) => current.map((field) => (field.name === name ? { ...field, value } : field)));
        }}
        onAccept={() => {
          args.onAccept?.();
          setState("accepted");
        }}
        onDecline={() => {
          args.onDecline?.();
          setState("declined");
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Submit: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
    await userEvent.type(canvas.getByRole("textbox", { name: "Deployment name *" }), "Release");
    await userEvent.click(canvas.getByRole("radio", { name: "Production" }));
    await expect(canvas.getByRole("radio", { name: "Production" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Staging" })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("switch", { name: "Remember settings" }));
    await expect(args.onFieldChange).toHaveBeenLastCalledWith("remember", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(args.onAccept).toHaveBeenCalledTimes(1);
    const receipt = canvas.getByRole("status");
    await expect(receipt).toHaveTextContent("Sent to Deployment service");
    await waitFor(() => expect(receipt).toHaveFocus());
  },
};
export const Decline: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Decline" }));
    await expect(args.onDecline).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent("Declined");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveFocus());
  },
};
export const ReadOnly: Story = {
  args: { onFieldChange: undefined, onAccept: undefined, onDecline: undefined },
  render: (args) => <ElicitationForm {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveAttribute("readonly");
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await expect(canvas.getByRole("switch")).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("radio", { name: "Staging" })).toHaveAttribute("aria-disabled", "true");
  },
};
export const Accepted: Story = {
  args: { state: "accepted" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent("Sent to Deployment service");
  },
};

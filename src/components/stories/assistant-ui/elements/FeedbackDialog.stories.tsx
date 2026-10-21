import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { FeedbackDialog } from "../../../assistant-ui/elements/FeedbackDialog.js";
const meta: Meta<typeof FeedbackDialog> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/FeedbackDialog",
  component: FeedbackDialog,
  tags: ["autodocs", "test"],
  args: {
    reasons: ["Incorrect", "Incomplete", "Unclear"],
    selected: [],
    note: "",
    sent: false,
    onToggleReason: fn(),
    onNoteChange: fn(),
    onSubmit: fn(),
  },
  render: function Interactive(args) {
    const [selected, setSelected] = useState([...args.selected]);
    const [note, setNote] = useState(args.note);
    const [sent, setSent] = useState(args.sent);
    return (
      <FeedbackDialog
        {...args}
        selected={selected}
        note={note}
        sent={sent}
        onToggleReason={(reason) => {
          args.onToggleReason?.(reason);
          setSelected((current) =>
            current.includes(reason) ? current.filter((value) => value !== reason) : [...current, reason],
          );
        }}
        onNoteChange={(value) => {
          args.onNoteChange?.(value);
          setNote(value);
        }}
        onSubmit={() => {
          args.onSubmit?.();
          setSent(true);
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const SelectAndSend: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const group = within(canvas.getByRole("group", { name: "Feedback reasons" }));
    await userEvent.click(group.getByRole("button", { name: "Incorrect" }));
    await userEvent.click(group.getByRole("button", { name: "Incomplete" }));
    await expect(group.getByRole("button", { name: "Incorrect" })).toHaveAttribute("aria-pressed", "true");
    await expect(group.getByRole("button", { name: "Incomplete" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.type(canvas.getByRole("textbox", { name: "Anything else?" }), "Missing retry instructions");
    await expect(args.onNoteChange).toHaveBeenLastCalledWith("Missing retry instructions");
    await userEvent.click(canvas.getByRole("button", { name: "Send feedback" }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent("Thanks.");
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  args: { selected: ["Incorrect"], onToggleReason: undefined, onNoteChange: undefined, onSubmit: undefined },
  render: (args) => <FeedbackDialog {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Incorrect" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Incorrect" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("textbox")).toHaveAttribute("readonly");
  },
};
export const Sent: Story = {
  args: { sent: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Thanks.");
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};

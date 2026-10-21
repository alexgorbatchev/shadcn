import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MobileComposer } from "../../../assistant-ui/elements/MobileComposer.js";

const meta: Meta<typeof MobileComposer> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/MobileComposer",
  component: MobileComposer,
  tags: ["autodocs", "test"],
  args: {
    value: "",
    keyboardOpen: false,
    running: false,
    actions: ["Explain", "Summarize"],
    onSend: fn(),
    onStop: fn(),
    onAttach: fn(),
    onAction: fn(),
    onValueChange: fn(),
    onFocus: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Compose: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <MobileComposer
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          args.onValueChange?.(next);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Explain" }));
    await expect(args.onAction).toHaveBeenCalledWith("Explain");
    await userEvent.click(canvas.getByRole("button", { name: "Add an attachment" }));
    await expect(args.onAttach).toHaveBeenCalledTimes(1);
    await userEvent.type(canvas.getByRole("textbox", { name: "Message" }), "Explain this{Enter}");
    await expect(args.onFocus).toHaveBeenCalled();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("Explain this");
    await expect(args.onSend).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(args.onSend).toHaveBeenCalledTimes(2);
  },
};

export const Running: Story = {
  args: { value: "Continue", running: true, keyboardOpen: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("textbox", { name: "Message" }));
    await userEvent.keyboard("{Enter}");
    await expect(args.onSend).not.toHaveBeenCalled();
    await expect(canvas.queryByRole("button", { name: "Explain" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Stop" }));
    await expect(args.onStop).toHaveBeenCalledTimes(1);
  },
};

export const ReadOnly: Story = {
  args: {
    value: "Read only message",
    onValueChange: undefined,
    onAttach: undefined,
    onAction: undefined,
    onSend: undefined,
    onStop: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveAttribute("readonly");
    await expect(canvas.getByRole("button", { name: "Add an attachment" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Explain" })).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
  },
};

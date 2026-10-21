import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { OptionList } from "../../../assistant-ui/elements/OptionList.js";

const meta: Meta<typeof OptionList> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/OptionList",
  component: OptionList,
  tags: ["autodocs", "test"],
  args: {
    "aria-label": "Layout choice",
    options: [
      { id: "compact", label: "Compact", description: "Keep the page visible" },
      { id: "wide", label: "Wide" },
      { id: "disabled", label: "Unavailable", disabled: true },
    ],
    onConfirm: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Unavailable" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Compact Keep the page visible" }));
    await expect(args.onConfirm).toHaveBeenCalledWith(["compact"]);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("Compact")).toBeVisible();
    await expect(canvas.queryByText("Wide")).not.toBeInTheDocument();
  },
};

export const Multiple: Story = {
  args: { selectionMode: "multiple", minSelections: 1, maxSelections: 1 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Confirm" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Compact Keep the page visible" }));
    await expect(canvas.getByRole("checkbox", { name: "Wide" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Wide" }));
    await expect(canvas.getByRole("checkbox", { name: "Wide" })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));
    await expect(args.onConfirm).toHaveBeenCalledWith(["compact"]);
    await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
  },
};

export const FailedSubmission: Story = {
  args: { onConfirm: fn(() => Promise.reject(new Error("Harness disconnected"))) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Wide" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Harness disconnected");
    await expect(canvas.getByRole("button", { name: "Wide" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Wide" }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(2);
  },
};

export const ReadOnly: Story = {
  args: { onConfirm: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Compact")).toBeVisible();
    await expect(canvas.getByText("Wide")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const EmptyReceipt: Story = {
  args: { choice: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Nothing selected")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

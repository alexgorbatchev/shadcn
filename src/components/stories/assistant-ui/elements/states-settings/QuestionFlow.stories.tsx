import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { QuestionFlow } from "../../../../assistant-ui/elements/QuestionFlow.js";

const meta: Meta<typeof QuestionFlow> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/QuestionFlow",
  component: QuestionFlow,
  tags: ["autodocs", "test"],
  args: {
    steps: [
      {
        id: "harness",
        question: "Choose a harness",
        options: [
          { id: "codex", label: "Codex" },
          { id: "claude", label: "Claude" },
        ],
      },
      {
        id: "context",
        question: "Choose context",
        selectionMode: "multiple",
        options: [
          { id: "page", label: "Page" },
          { id: "selection", label: "Selection" },
        ],
      },
    ],
    onComplete: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Codex" }));
    await expect(await canvas.findByRole("checkbox", { name: "Page" })).toHaveFocus();
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "Question 2 of 2");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Selection" }));
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(args.onComplete).toHaveBeenCalledWith({ harness: ["codex"], context: ["selection"] });
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("Codex")).toBeVisible();
    await expect(canvas.getByText("Selection")).toBeVisible();
  },
};

export const Back: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Codex" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Back" }));
    await expect(canvas.getByRole("button", { name: "Codex" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Claude" }));
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Page" }));
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(args.onComplete).toHaveBeenCalledWith({ harness: ["claude"], context: ["page"] });
  },
};

export const FailedSubmission: Story = {
  args: { onComplete: fn(() => Promise.reject(new Error("Session unavailable"))) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Codex" }));
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Page" }));
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Session unavailable");
    await expect(canvas.getByRole("button", { name: "Back" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Submit" })).toBeEnabled();
  },
};

export const ReadOnly: Story = {
  args: { onComplete: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Choose a harness")).toBeVisible();
    await expect(canvas.getByText("Choose context")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const Receipt: Story = {
  args: { choice: { harness: ["claude"], context: ["page", "selection"] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Claude")).toBeVisible();
    await expect(canvas.getByText("Page, Selection")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NativeRuntimeFixture } from "../native/helpers.js";
import { EveAskQuestion } from "../../../assistant-ui/elements/EveAskQuestion.js";
const meta: Meta<typeof EveAskQuestion> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/EveAskQuestion",
  component: EveAskQuestion,
  tags: ["autodocs", "test"],
  args: {
    type: "tool-call",
    toolCallId: "question-1",
    toolName: "ask_question",
    args: { question: "Which environment?" },
    argsText: "{}",
    status: { type: "complete" },
    addResult: fn(),
    resume: fn(),
    respondToApproval: fn(async () => {}),
    result: { status: "answered", answer: "Staging" },
  },
  render: (args) => (
    <NativeRuntimeFixture>
      <EveAskQuestion {...args} />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Answered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Which environment?")).toBeVisible();
    await expect(canvas.getByText("Staging")).toBeVisible();
  },
};
export const Skipped: Story = {
  args: { result: { interrupted: true } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Skipped")).toBeVisible();
  },
};
export const Unavailable: Story = {
  args: { result: { status: "unavailable" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Unavailable in this session")).toBeVisible();
  },
};
export const Error: Story = {
  args: { result: { error: "Connection lost" }, isError: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Error: Connection lost")).toBeVisible();
  },
};
export const UnknownResult: Story = {
  args: { result: { reason: "Custom response" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Custom response/)).toBeVisible();
  },
};
export const Pending: Story = {
  args: { result: undefined, status: { type: "running" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId("EveAskQuestion")).not.toBeInTheDocument();
  },
};
export const Approval: Story = {
  args: {
    result: undefined,
    status: { type: "requires-action", reason: "tool-calls" },
    approval: {
      id: "approval-1",
      prompt: "Which environment?",
      display: "select",
      options: [{ id: "staging", label: "Staging", kind: "allow-once" }],
    },
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Staging" }));
    await expect(args.respondToApproval).toHaveBeenCalledWith({ optionId: "staging" });
  },
};
export const AnsweredReceipt: Story = {
  args: { approval: { id: "answered-question", approved: true } },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Allowed")).toBeVisible();
    await expect(canvas.getByText("Staging")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(args.respondToApproval).not.toHaveBeenCalled();
  },
};
export const NativeReceiptText: Story = {
  args: { approval: { id: "native-answer", approved: true, text: "User supplied answer" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Allowed")).toBeVisible();
    await expect(canvas.getByText("User supplied answer")).toBeVisible();
    await expect(canvas.queryByText("Staging")).not.toBeInTheDocument();
  },
};
export const DeniedErrorReceipt: Story = {
  args: { approval: { id: "denied-question", approved: false }, isError: true, result: { error: "Permission denied" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Denied")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Error: Permission denied")).not.toBeInTheDocument();
  },
};
export const ExecutionErrorAfterApproval: Story = {
  args: { approval: { id: "failed-question", approved: true }, isError: true, result: { error: "Connection lost" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Which environment?")).toBeVisible();
    await expect(canvas.getByText("Error: Connection lost")).toBeVisible();
    await expect(canvas.queryByText("Allowed")).not.toBeInTheDocument();
  },
};
export const UnsettledResult: Story = {
  args: { approval: { id: "pending-native-receipt", prompt: "Native prompt" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Native prompt")).toBeVisible();
    await expect(canvas.getByText("Staging")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Cancelled: Story = {
  args: { result: undefined, approval: { id: "cancelled-question", resolution: "cancelled" } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("Cancelled before a decision")).toBeVisible();
  },
};
export const NoPrompt: Story = {
  args: { args: {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Staging")).toBeVisible();
    await expect(canvas.queryByText("Which environment?")).not.toBeInTheDocument();
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ToolFallbackApproval } from "../../../assistant-ui/native/ToolFallbackRoot.js";
import {
  ApprovalFixture,
  ApprovalSurfaceFixture,
  ReadonlyApprovalFixture,
  ApprovalLifecycleFixture,
} from "./fixtures/approval.js";

const meta: Meta<typeof ToolFallbackApproval> = {
  component: ToolFallbackApproval,
  title: "shadcn-alexgorbatchev/assistant-ui/native/ToolFallbackApproval",
  tags: ["autodocs", "test"],
  render: (args) => <ApprovalFixture approval={args.approval ?? { id: "decision", prompt: "Run deployment?" }} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const AllowDecision: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Allow" }));
    await expect(await canvas.findByText("Allowed")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Deny" })).not.toBeInTheDocument();
  },
};
export const DenyWithNote: Story = {
  args: { approval: { id: "deny-note", prompt: "Run deployment?", allowFreeform: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByRole("textbox", { name: "Note" }), "Wait for review");
    await userEvent.click(canvas.getByRole("button", { name: "Deny" }));
    await expect(await canvas.findByText("Denied")).toBeVisible();
    await expect(canvas.getByText("Wait for review")).toBeVisible();
  },
};
export const ConfirmPersistentPermission: Story = {
  args: {
    approval: {
      id: "persistent",
      prompt: "Allow repository writes?",
      options: [
        {
          id: "always",
          kind: "allow-always",
          confirm: { title: "Save repository permission?", description: "Applies to future writes" },
          grants: ["repository:write"],
        },
        { id: "never", kind: "reject-always" },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Always allow" }));
    await expect(canvas.getByText("repository:write")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await userEvent.click(canvas.getByRole("button", { name: "Always allow" }));
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));
    await expect(await canvas.findByText("Allowed")).toBeVisible();
    await expect(canvas.getByText("· Always allow")).toBeVisible();
  },
};
export const CustomChoice: Story = {
  args: {
    approval: {
      id: "choice",
      prompt: "Choose target",
      display: "select",
      options: [{ id: "staging", kind: "_target", label: "Staging" }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Staging" }));
    await expect(await canvas.findByText("Answered")).toBeVisible();
    await expect(canvas.getByText("· Staging")).toBeVisible();
  },
};
export const TextAnswer: Story = {
  args: { approval: { id: "text", prompt: "What should change?", display: "text", dismissible: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByRole("textbox", { name: "What should change?" }), "Update tests");
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(await canvas.findByText("Answered")).toBeVisible();
    await expect(canvas.getByText("Update tests")).toBeVisible();
  },
};
export const DismissQuestion: Story = {
  args: { approval: { id: "dismiss", prompt: "Choose target", display: "select", dismissible: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Dismiss" }));
    await expect(await canvas.findByText("Dismissed")).toBeVisible();
  },
};
export const FailedResponseRetry: Story = {
  render: () => <ApprovalFixture approval={{ id: "retry", prompt: "Run deployment?" }} shouldRejectFirst />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Allow" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Permission service unavailable");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Allow" })).toBeEnabled());
    await userEvent.click(canvas.getByRole("button", { name: "Allow" }));
    await expect(await canvas.findByText("Allowed")).toBeVisible();
  },
};
export const MultipleQuestions: Story = {
  args: {
    approval: {
      id: "questions",
      prompt: "Configure deployment",
      display: "questions",
      dismissible: true,
      questions: [
        {
          id: "targets",
          header: "Targets",
          prompt: "Select regions",
          multiple: true,
          allowFreeform: true,
          options: [
            { id: "eu", label: "Europe", description: "European region" },
            { id: "us", label: "America", description: "American region" },
          ],
        },
        { id: "reason", prompt: "Why deploy?" },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const send = await canvas.findByRole("button", { name: "Send" });
    await expect(send).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Europe European region" }));
    await userEvent.click(canvas.getByRole("button", { name: "America American region" }));
    await userEvent.click(canvas.getByRole("button", { name: "America American region" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Select regions" }), "Asia later");
    await userEvent.type(canvas.getByRole("textbox", { name: "Why deploy?" }), "Security update");
    await userEvent.click(send);
    await expect(await canvas.findByText("Answered")).toBeVisible();
    await expect(canvas.getByText("· Europe, Asia later")).toHaveTextContent("Targets · Europe, Asia later");
    await expect(canvas.getByText("· Security update")).toHaveTextContent("Why deploy? · Security update");
  },
};
export const SingleQuestionChoice: Story = {
  args: {
    approval: {
      id: "single",
      display: "questions",
      questions: [
        {
          id: "target",
          prompt: "Target",
          options: [
            { id: "a", label: "Alpha" },
            { id: "b", label: "Beta" },
          ],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Alpha" }));
    await userEvent.click(canvas.getByRole("button", { name: "Beta" }));
    await expect(canvas.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(await canvas.findByText("Answered")).toBeVisible();
    await expect(canvas.getByText("· Beta")).toHaveTextContent("Target · Beta");
  },
};
export const CancelledReceipt: Story = {
  args: { approval: { id: "cancelled", prompt: "Run deployment?", resolution: "cancelled" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Cancelled before a decision")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const ExpiredReceipt: Story = {
  args: { approval: { id: "expired", resolution: "expired" } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("Expired before a decision")).toBeVisible();
  },
};
export const AutomaticReceipt: Story = {
  args: {
    approval: {
      id: "automatic",
      approved: true,
      isAutomatic: true,
      optionId: "removed-rule",
      reason: "Trusted repository",
      text: "Trusted repository",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Allowed automatically")).toBeVisible();
    await expect(canvas.getAllByText("Trusted repository")).toHaveLength(1);
    await expect(canvas.getByText("· removed-rule")).toBeVisible();
  },
};
export const DeclaredDenial: Story = {
  args: { approval: { id: "declared-denial", options: [{ id: "never", kind: "reject-always" }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Always deny" }));
    await expect(await canvas.findByText("Denied")).toBeVisible();
    await expect(canvas.getByText("· Always deny")).toBeVisible();
  },
};
export const DefaultDenialWithCustomOption: Story = {
  args: { approval: { id: "fallback-denial", options: [{ id: "custom-action", kind: "_action" }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "custom-action" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Deny" }));
    await expect(await canvas.findByText("Denied")).toBeVisible();
  },
};
export const SimpleConfirmation: Story = {
  args: {
    approval: {
      id: "confirmation",
      options: [{ id: "once", kind: "allow-once", confirm: true, description: "Executes once" }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Allow" }));
    await expect(canvas.getByText("Allow?")).toBeVisible();
    await expect(canvas.getByText("Executes once")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));
    await expect(await canvas.findByText("Allowed")).toBeVisible();
  },
};
export const DismissQuestionsWithoutSubmittingDraft: Story = {
  args: {
    approval: {
      id: "dismiss-questions",
      display: "questions",
      dismissible: true,
      questions: [{ id: "draft", prompt: "Why deploy?" }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByRole("textbox", { name: "Why deploy?" }), "Unfinished draft");
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(await canvas.findByText("Dismissed")).toBeVisible();
    await expect(canvas.queryByText("Unfinished draft")).not.toBeInTheDocument();
  },
};
export const DismissTextWithoutSubmittingDraft: Story = {
  args: { approval: { id: "dismiss-text", display: "text", prompt: "Why deploy?", dismissible: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByRole("textbox", { name: "Why deploy?" }), "Unfinished draft");
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(await canvas.findByText("Dismissed")).toBeVisible();
    await expect(canvas.queryByText("Unfinished draft")).not.toBeInTheDocument();
  },
};
export const EmptyQuestionList: Story = {
  args: { approval: { id: "empty-questions", display: "questions", questions: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Send" })).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: "Deny" })).not.toBeInTheDocument();
  },
};
export const LegacyAllow: Story = {
  args: { status: { type: "requires-action", reason: "tool-calls" }, addResult: fn() },
  render: (args) => <ApprovalSurfaceFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Allow" }));
    await expect(args.addResult).toHaveBeenCalledWith("Approved by user");
    await expect(canvas.getByRole("button", { name: "Allow" })).toBeDisabled();
  },
};
export const LegacyDeny: Story = {
  ...LegacyAllow,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(await within(canvasElement).findByRole("button", { name: "Deny" }));
    await expect(args.addResult).toHaveBeenCalledWith("User denied tool execution");
  },
};
export const ResumeInterrupt: Story = {
  args: {
    status: { type: "requires-action", reason: "interrupt" },
    interrupt: { type: "human", payload: "Confirm" },
    resume: fn(),
  },
  render: (args) => <ApprovalSurfaceFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(await within(canvasElement).findByRole("button", { name: "Allow" }));
    await expect(args.resume).toHaveBeenCalledWith({ approved: true });
  },
};
export const MissingInterrupt: Story = {
  args: { status: { type: "requires-action", reason: "interrupt" } },
  render: (args) => <ApprovalSurfaceFixture {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const ReadonlyRequest: Story = {
  args: {
    approval: { id: "readonly", prompt: "Awaiting another reviewer" },
    status: { type: "requires-action", reason: "tool-calls" },
  },
  render: (args) => <ReadonlyApprovalFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Awaiting another reviewer")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const ReadonlyWithoutPrompt: Story = {
  ...ReadonlyRequest,
  args: { ...ReadonlyRequest.args, approval: { id: "readonly-empty" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const MissingQuestionList: Story = {
  ...EmptyQuestionList,
  args: { approval: { id: "missing-list", display: "questions" } },
  play: EmptyQuestionList.play,
};
export const BlankTextAnswer: Story = {
  args: { approval: { id: "blank", display: "text" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("textbox", { name: "Answer" })).toHaveValue("");
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(await canvas.findByText("Answered")).toBeVisible();
  },
};
export const HistoricalAnswers: Story = {
  args: {
    approval: {
      id: "history",
      approved: true,
      display: "questions",
      questions: [
        { id: "choice", prompt: "Target", options: [{ id: "old", label: "Old choice" }] },
        { id: "unanswered", prompt: "Skipped" },
      ],
      answers: { choice: { optionIds: ["deleted-choice"] } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("· deleted-choice")).toHaveTextContent("Target · deleted-choice");
    await expect(canvas.queryByText("Skipped")).not.toBeInTheDocument();
  },
};
export const RequestLifecycle: Story = {
  render: () => <ApprovalLifecycleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole("button", { name: "Request input" }));
    await userEvent.type(await canvas.findByRole("textbox", { name: "Release note" }), "Publish the reviewed version");
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Request input" }));
    await expect(canvas.getByRole("textbox", { name: "Release note" })).toHaveValue("");
    await expect(canvas.getByRole("button", { name: "Send" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Complete request" }));
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};

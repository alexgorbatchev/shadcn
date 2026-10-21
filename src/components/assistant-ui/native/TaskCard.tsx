import type { ReactElement } from "react";
import {
  MessagePrimitive,
  ReadonlyThreadProvider,
  ThreadPrimitive,
  useAuiState,
  type ThreadMessage,
  type ToolCallMessagePart,
  type ToolCallMessagePartComponent,
  type ToolCallMessagePartProps,
  type ToolCallMessagePartStatus,
} from "@assistant-ui/react";
import { type FC } from "react";
import { isTaskPart } from "../utils/isTaskPart.js";
import { MarkdownText } from "../elements/MarkdownText.js";
import {
  formatUnknownValue,
  offersInterruptAction,
  ToolFallback,
  ToolFallbackApproval,
  ToolFallbackError,
} from "./ToolFallbackRoot.js";
import { cn } from "../../../utils/cn.js";
import { mono } from "../elements/constants.js";
import { TaskCard as TaskCardBase } from "../elements/TaskCard.js";
import { formatElapsed, taskLabel, taskMeta, taskStateOf } from "../utils/taskUtils.js";
import { useTaskElapsed } from "../hooks/useTaskElapsed.js";

type TaskTranscriptContract = {
  messages: readonly ThreadMessage[];
};

type TaskResultContract = {
  result: unknown;
};

type TaskCardProps = {
  part: TaskPart;
  className?: string;
};

export type { TaskCardState } from "../elements/TaskCard.js";

export type TaskPart = ToolCallMessagePart & {
  readonly status: ToolCallMessagePartStatus;
} & Partial<Pick<ToolCallMessagePartProps, "addResult" | "resume" | "respondToApproval">>;

const ROLE_LABELS = {
  user: "instruction",
  assistant: "agent",
  system: "system",
} as const;
const NestedToolCall: ToolCallMessagePartComponent = (part) =>
  isTaskPart(part) ? <TaskCard part={part} /> : <ToolFallback {...part} />;
const NestedMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);
  return (
    <MessagePrimitive.Root
      data-slot="aui_task-transcript-message"
      data-role={role}
      render={<div className="flex flex-col gap-1 text-sm leading-relaxed" />}
    >
      <span className={cn(mono, "text-muted-foreground")}>{ROLE_LABELS[role]}</span>
      <MessagePrimitive.Parts components={{ Text: MarkdownText, tools: { Fallback: NestedToolCall } }} />
    </MessagePrimitive.Root>
  );
};
const TaskTranscript: FC<TaskTranscriptContract> = ({ messages }) => (
  <ReadonlyThreadProvider messages={messages}>
    <ThreadPrimitive.Messages>{() => <NestedMessage />}</ThreadPrimitive.Messages>
  </ReadonlyThreadProvider>
);
const TaskResult: FC<TaskResultContract> = ({ result }) =>
  typeof result === "string" ? (
    <p className="m-0 whitespace-pre-wrap">{result}</p>
  ) : (
    <pre className="m-0 overflow-x-auto whitespace-pre-wrap">{formatUnknownValue(result, 2)}</pre>
  );
export function TaskCard({ part, className }: TaskCardProps): ReactElement {
  const elapsedMs = useTaskElapsed(
    part.timing,
    part.status.type === "running" || part.status.type === "requires-action",
  );
  const canAnswer = useAuiState((s) => s.thread.capabilities.answerToolCall);
  const messages = part.messages ?? [];
  const showError = part.status.type === "incomplete" && part.status.error !== undefined && part.status.error !== null;
  const result =
    showError || part.result !== undefined ? (
      <>
        {showError && <ToolFallbackError status={part.status} />}
        {part.result !== undefined && <TaskResult result={part.result} />}
      </>
    ) : undefined;
  const approvalPending =
    part.approval == null || (part.approval.approved === undefined && part.approval.resolution === undefined);
  const actions =
    part.status.type === "requires-action" &&
    approvalPending &&
    offersInterruptAction(part.status, part.approval, part.interrupt) &&
    (canAnswer || part.approval?.prompt) ? (
      <ToolFallbackApproval
        status={part.status}
        {...(part.approval !== undefined && { approval: part.approval })}
        {...(part.interrupt !== undefined && { interrupt: part.interrupt })}
        {...(part.addResult && { addResult: part.addResult })}
        {...(part.resume && { resume: part.resume })}
        {...(part.respondToApproval && {
          respondToApproval: part.respondToApproval,
        })}
      />
    ) : undefined;
  return (
    <TaskCardBase
      className={className}
      label={taskLabel(part.toolName, part.args)}
      meta={taskMeta(part.args)}
      state={taskStateOf(part.status, part.isError)}
      elapsed={elapsedMs === undefined ? undefined : formatElapsed(elapsedMs)}
      actions={actions}
      result={result}
    >
      {messages.length > 0 ? <TaskTranscript messages={messages} /> : undefined}
    </TaskCardBase>
  );
}

import { fromThreadMessageLike, MessagePrimitive, ThreadPrimitive, type ThreadMessageLike } from "@assistant-ui/react";
import type { ReactElement } from "react";
import { TaskCard } from "../../../../../assistant-ui/native/TaskCard.js";
import { TaskGroup } from "../../../../../assistant-ui/native/TaskGroup.js";
import { Thread } from "../../../../../assistant-ui/native/Thread.js";
import { NativeRuntimeFixture } from "../../helpers.js";

interface INativeTaskFixtureProps {
  state?: "done" | "failed" | "cancelled" | "waiting" | "running";
  group?: boolean;
  count?: number;
}
const nested = fromThreadMessageLike(
  { role: "assistant", content: "Inspection completed in the nested agent." },
  "nested-inspection",
  { type: "complete", reason: "stop" },
);
export function NativeTaskFixture({ state = "done", group = false, count }: INativeTaskFixtureProps): ReactElement {
  const content: ThreadMessageLike["content"] = Array.from({ length: count ?? (group ? 6 : 1) }, (_, index) => ({
    type: "tool-call",
    toolCallId: `task-${index}`,
    toolName: "delegate",
    args: { description: `Inspect service ${index + 1}`, subagent_type: "explorer" },
    argsText: "{}",
    messages: [nested],
    ...(state === "done" ? { result: { checked: true } } : {}),
    ...(state === "failed" ? { result: "Permission denied", isError: true } : {}),
  }));
  const status: ThreadMessageLike["status"] =
    state === "waiting"
      ? { type: "requires-action", reason: "tool-calls" }
      : state === "running"
        ? { type: "running" }
        : state === "cancelled"
          ? { type: "incomplete", reason: "cancelled" }
          : { type: "complete", reason: "stop" };
  return (
    <NativeRuntimeFixture initialMessages={[{ role: "assistant", content, status }]}>
      {group ? (
        <Thread components={{ TaskGroup }} />
      ) : (
        <ThreadPrimitive.Root>
          <ThreadPrimitive.Messages
            components={{
              UserMessage: () => (
                <MessagePrimitive.Root>
                  <MessagePrimitive.Parts />
                </MessagePrimitive.Root>
              ),
              AssistantMessage: () => (
                <MessagePrimitive.Root>
                  <MessagePrimitive.Parts components={{ tools: { Fallback: (part) => <TaskCard part={part} /> } }} />
                </MessagePrimitive.Root>
              ),
            }}
          />
        </ThreadPrimitive.Root>
      )}
    </NativeRuntimeFixture>
  );
}

import type { ReactElement } from "react";
import { fromThreadMessageLike } from "@assistant-ui/react";
import { TaskCard, type TaskPart } from "../../../../assistant-ui/native/TaskCard.js";
import { NativeRuntimeFixture } from "../helpers.js";

export function TaskPartFixture({ part }: { part: Partial<TaskPart> }): ReactElement {
  return (
    <NativeRuntimeFixture>
      <TaskCard
        part={{
          type: "tool-call",
          toolCallId: "review",
          toolName: "delegate",
          args: { description: "Review workspace" },
          argsText: "{}",
          status: { type: "complete" },
          ...part,
        }}
      />
    </NativeRuntimeFixture>
  );
}

export const fixture_nestedTaskMessages = [
  fromThreadMessageLike(
    {
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolCallId: "nested-tool",
          toolName: "inspect",
          args: {},
          argsText: "{}",
          result: { healthy: true },
        },
        {
          type: "tool-call",
          toolCallId: "nested-task",
          toolName: "delegate",
          args: { description: "Review nested service" },
          argsText: "{}",
          result: "Nested review complete",
          messages: [],
        },
      ],
    },
    "nested-task-message",
    { type: "complete", reason: "stop" },
  ),
];

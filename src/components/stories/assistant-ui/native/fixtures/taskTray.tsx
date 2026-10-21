import type { ReactElement } from "react";
import type { ThreadMessageLike } from "@assistant-ui/react";
import { TaskTray } from "../../../../assistant-ui/native/TaskTray.js";
import { NativeRuntimeFixture } from "../helpers.js";

interface ITaskTrayFixtureProps {
  state?: "done" | "failed" | "waiting" | "running";
  count?: number;
}

export function TaskTrayFixture({ state = "done", count = 6 }: ITaskTrayFixtureProps): ReactElement {
  const content: ThreadMessageLike["content"] = Array.from({ length: count }, (_, index) => ({
    type: "tool-call",
    toolCallId: `inspection-${index}`,
    toolName: "delegate",
    args: { description: `Inspect service ${index + 1}`, subagent_type: "explorer" },
    argsText: "{}",
    messages: [],
    ...(state === "done" ? { result: "Checked" } : {}),
    ...(state === "failed" ? { result: "Permission denied", isError: true } : {}),
  }));
  const status: ThreadMessageLike["status"] =
    state === "running"
      ? { type: "running" }
      : state === "waiting"
        ? { type: "requires-action", reason: "tool-calls" }
        : { type: "complete", reason: "stop" };
  return (
    <NativeRuntimeFixture initialMessages={[{ role: "assistant", content, status }]}>
      <TaskTray />
    </NativeRuntimeFixture>
  );
}

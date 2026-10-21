import type { TaskState } from "@assistant-ui/react";

export function factory_taskState(overrides: Partial<TaskState> = {}): TaskState {
  return {
    id: "task",
    messageId: "message",
    parentTaskId: null,
    depth: 0,
    toolName: "delegate",
    args: { description: "Inspect service" },
    messages: [],
    status: { type: "complete" },
    ...overrides,
  };
}

import type { TaskState } from "@assistant-ui/react";
import type { AgentState } from "../elements/AgentStatus.js";
import type { TaskSummary } from "./taskSummary/types.js";
import { taskLabel, taskStateOf } from "./taskUtils.js";

export function summarizeTasks(tasks: readonly TaskState[]): TaskSummary {
  let running = 0;
  let waiting = 0;
  let failed = 0;
  let startedAt: number | undefined;
  let runningLabel: string | undefined;
  for (const task of tasks) {
    const state = taskStateOf(task.status, task.isError);
    if (state === "working") {
      running += 1;
      runningLabel ??= taskLabel(task.toolName, task.args);
      const taskStartedAt = task.timing?.startedAt;
      if (taskStartedAt !== undefined && (startedAt === undefined || taskStartedAt < startedAt)) {
        startedAt = taskStartedAt;
      }
    } else if (state === "waiting") waiting += 1;
    else if (state === "failed") failed += 1;
  }
  return { total: tasks.length, running, waiting, failed, startedAt, runningLabel };
}

export function summaryState(summary: TaskSummary): AgentState {
  if (summary.running > 0) return "working";
  if (summary.waiting > 0) return "waiting";
  return summary.failed > 0 ? "failed" : "done";
}

const plural = (count: number, noun: string) => `${count} ${count === 1 ? noun : `${noun}s`}`;
export function summaryLabel(summary: TaskSummary): string {
  if (summary.running === 1 && summary.runningLabel !== undefined) return summary.runningLabel;
  if (summary.running > 0) return `${summary.running} of ${plural(summary.total, "task")} running`;
  if (summary.waiting > 0) return `${plural(summary.waiting, "task")} waiting for input`;
  if (summary.failed > 0) return `${plural(summary.total, "task")} done, ${summary.failed} failed`;
  return `${plural(summary.total, "task")} done`;
}

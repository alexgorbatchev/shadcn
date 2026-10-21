import { useMemo } from "react";
import { useAuiState } from "@assistant-ui/react";
import type { TaskSummary } from "../utils/taskSummary/types.js";
import { summarizeTasks } from "../utils/taskSummaryUtils.js";

export function useTaskSummary(): TaskSummary {
  const tasks = useAuiState((state) => state.thread.tasks);
  return useMemo(() => summarizeTasks(tasks), [tasks]);
}

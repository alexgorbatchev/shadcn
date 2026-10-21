import type { ReactElement } from "react";
import { AgentStatus as AgentStatusBase } from "../elements/AgentStatus.js";
import { useTaskSummary } from "../hooks/useTaskSummary.js";
import { useTaskElapsed } from "../hooks/useTaskElapsed.js";
import { formatElapsed } from "../utils/taskUtils.js";
import { summaryState, summaryLabel } from "../utils/taskSummaryUtils.js";
type AgentStatusProps = { className?: string };
export function AgentStatus({ className }: AgentStatusProps): ReactElement | null {
  const summary = useTaskSummary();
  const elapsedMs = useTaskElapsed(
    summary.startedAt === undefined ? undefined : { startedAt: summary.startedAt },
    summary.running > 0,
  );
  if (summary.running === 0 && summary.waiting === 0) return null;
  return (
    <AgentStatusBase
      className={className}
      state={summaryState(summary)}
      label={summaryLabel(summary)}
      elapsed={elapsedMs === undefined ? undefined : formatElapsed(elapsedMs)}
    />
  );
}

import { MessagePrimitive, useAui, useAuiState } from "@assistant-ui/react";
import { type ReactElement, type FC, useState } from "react";
import { cn } from "../../../utils/cn.js";
import { Button } from "../../Button.js";
import { TASK_PAGE_SIZE, taskStateOf } from "../utils/taskUtils.js";
import { TaskCard } from "./TaskCard.js";
type TaskLaneContract = { index: number };
type TaskGroupProps = { group: MessagePrimitive.GroupedParts.GroupPart; className?: string };
const KEY_SEPARATOR = String.fromCharCode(31);
const TaskLane: FC<TaskLaneContract> = ({ index }) => {
  const aui = useAui();
  const part = useAuiState((s) => s.message.parts[index]);
  if (part?.type !== "tool-call") return null;
  const client = aui.message.part({ toolCallId: part.toolCallId });
  return (
    <TaskCard
      part={{
        ...part,
        addResult: client.addToolResult,
        resume: client.resumeToolCall,
        respondToApproval: client.respondToToolApproval,
      }}
    />
  );
};
export function TaskGroup({ group, className }: TaskGroupProps): ReactElement {
  const [visible, setVisible] = useState(TASK_PAGE_SIZE);
  const { indices, counts } = group;
  // A selector has to return a stable value, so the lane keys travel as one string and are split afterwards.
  const laneKeys = useAuiState((s) =>
    indices
      .map((index) => {
        const part = s.message.parts[index];
        return part?.type === "tool-call" ? part.toolCallId : String(index);
      })
      .join(KEY_SEPARATOR),
  ).split(KEY_SEPARATOR);
  const failed = useAuiState((s) =>
    indices.reduce((count, index) => {
      const part = s.message.parts[index];
      return part?.type === "tool-call" && taskStateOf(part.status, part.isError) === "failed" ? count + 1 : count;
    }, 0),
  );
  if (indices.length === 1) return <TaskLane index={indices[0]!} />;
  const shown = indices.slice(0, visible);
  const hidden = indices.length - shown.length;
  const summary = [
    `${indices.length} tasks`,
    counts.running > 0 && `${counts.running} running`,
    counts.requiresAction > 0 && `${counts.requiresAction} waiting`,
    failed > 0 && `${failed} failed`,
  ].filter((entry): entry is string => typeof entry === "string");
  return (
    <div data-slot="aui_task-group" className={cn("flex w-full max-w-sm flex-col gap-2", className)}>
      <div data-slot="aui_task-group-summary" className="text-muted-foreground px-1 text-sm">
        {summary.join(" · ")}
      </div>
      {shown.map((index, position) => (
        <TaskLane key={laneKeys[position] ?? index} index={index} />
      ))}
      {hidden > 0 && (
        <Button
          variant="ghost"
          size="content"
          type="button"
          data-slot="aui_task-group-more"
          onClick={() => setVisible((count) => count + TASK_PAGE_SIZE)}
        >
          Show {Math.min(hidden, TASK_PAGE_SIZE)} more
        </Button>
      )}
    </div>
  );
}

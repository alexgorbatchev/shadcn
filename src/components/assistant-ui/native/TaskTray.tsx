import { useMemo, useState, type ComponentProps, type FC, type ReactElement } from "react";
import { useAuiState, type TaskState } from "@assistant-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../Popover.js";
import { cn } from "../../../utils/cn.js";
import { AgentStatus as AgentStatusBase } from "../elements/AgentStatus.js";
import type { AgentStatus } from "./AgentStatus.js";
import { mono } from "../elements/constants.js";
import { TaskStateIcon } from "../elements/TaskStateIcon.js";
import { formatElapsed, TASK_PAGE_SIZE, taskLabel, taskMeta, taskStateOf } from "../utils/taskUtils.js";
import { useTaskElapsed } from "../hooks/useTaskElapsed.js";
import { summarizeTasks, summaryState, summaryLabel } from "../utils/taskSummaryUtils.js";
type TaskTrayItemContract = { task: TaskState };
const TaskTrayItem: FC<TaskTrayItemContract> = ({ task }) => {
  const state = taskStateOf(task.status, task.isError);
  const meta = taskMeta(task.args);
  const elapsedMs = useTaskElapsed(
    task.timing,
    task.status.type === "running" || task.status.type === "requires-action",
  );
  return (
    <li
      data-slot="aui_task-tray-item"
      data-state={state}
      className="flex items-center gap-2.5 rounded-md py-2 pe-2.5 text-sm"
      style={{ paddingInlineStart: `${0.625 + task.depth * 0.75}rem` }}
    >
      <TaskStateIcon state={state} />
      <span className="sr-only">{state}</span>
      <span className="min-w-0 flex-1 truncate">{taskLabel(task.toolName, task.args)}</span>
      {meta !== undefined && (
        <span className={cn(mono, "text-muted-foreground max-w-24 shrink-0 truncate")}>{meta}</span>
      )}
      {elapsedMs !== undefined && (
        <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>{formatElapsed(elapsedMs)}</span>
      )}
    </li>
  );
};
export function TaskTray({ className }: ComponentProps<typeof AgentStatus>): ReactElement | null {
  const tasks = useAuiState((s) => s.thread.tasks);
  const summary = useMemo(() => summarizeTasks(tasks), [tasks]);
  const elapsedMs = useTaskElapsed(
    summary.startedAt === undefined ? undefined : { startedAt: summary.startedAt },
    summary.running > 0,
  );
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(TASK_PAGE_SIZE);
  const firstTask = tasks[0];
  const listKey = firstTask === undefined ? "" : `${firstTask.messageId}:${firstTask.id}`;
  const [seenListKey, setSeenListKey] = useState(listKey);
  if (seenListKey !== listKey) {
    setSeenListKey(listKey);
    setVisible(TASK_PAGE_SIZE);
  }
  if (summary.total === 0 && open) setOpen(false);
  if (summary.total === 0) return null;
  const hidden = Math.max(0, tasks.length - visible);
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setVisible(TASK_PAGE_SIZE);
      }}
    >
      <PopoverTrigger
        aria-label={summaryLabel(summary)}
        className={cn(
          "focus-visible:ring-ring/50 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 text-start focus-visible:ring-[3px] focus-visible:outline-none",
          className,
        )}
      >
        <AgentStatusBase
          state={summaryState(summary)}
          label={summaryLabel(summary)}
          elapsed={elapsedMs === undefined ? undefined : formatElapsed(elapsedMs)}
          endEnhancer={
            <ChevronDownIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 transition-transform group-data-open:rotate-180 motion-reduce:transition-none"
            />
          }
        />
      </PopoverTrigger>
      <PopoverContent align="end">
        <ul data-slot="aui_task-tray" aria-label="Tasks" className="flex max-h-80 flex-col overflow-y-auto">
          {tasks.slice(0, visible).map((task, index) => (
            <TaskTrayItem key={`${index}:${task.id}`} task={task} />
          ))}
          {hidden > 0 && (
            <li className="flex">
              <button
                type="button"
                data-slot="aui_task-tray-more"
                onClick={() => setVisible((count) => count + TASK_PAGE_SIZE)}
                className="text-muted-foreground hover:text-foreground px-2.5 py-2 text-sm transition-colors"
              >
                Show {Math.min(hidden, TASK_PAGE_SIZE)} more
              </button>
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

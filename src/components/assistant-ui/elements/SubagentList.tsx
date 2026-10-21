import { Progress } from "../../Progress.js";
import type { JSX } from "react";
type SubagentListProps = Omit<
  ComponentProps<"div">,
  "children" | "agents" | "completedCount" | "progress" | "showSummary" | "summaryAgent"
> & {
  agents: readonly ISubagentItem[];
  completedCount: number;
  progress: readonly number[];
  showSummary: boolean;
  summaryAgent: ISubagentItem;
};
import type { ComponentProps } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { pct } from "../utils/range.js";
export interface ISubagentItem {
  name: string;
  model: string;
}
export function SubagentList({
  agents,
  completedCount,
  progress,
  showSummary,
  summaryAgent,
  className,
  ...props
}: SubagentListProps): JSX.Element {
  return (
    <div
      data-testid="SubagentList"
      data-slot="subagent-list"
      className={cn(cn("flex w-full max-w-xs flex-col gap-2"), className)}
      {...props}
    >
      {agents.map((agent, index) => {
        const done = index < completedCount;
        const width = progress[index] ?? 0;
        const percentage = pct(width, 100);
        return (
          <div key={agent.name} className={cn(paper, "flex flex-col gap-2 rounded-md px-3.5 py-2.5")}>
            <div className="flex items-center gap-2">
              {done ? (
                <CheckIcon aria-hidden="true" className={cn("size-4")} />
              ) : (
                <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
              )}
              <span className="flex-1 truncate text-base">{agent.name}</span>
              <span className={cn(mono, "text-muted-foreground")}>{agent.model}</span>
            </div>
            <Progress aria-label={`${agent.name} progress`} value={percentage} tone={done ? "success" : "muted"} />
          </div>
        );
      })}
      {showSummary && (
        <div
          className={cn(
            paper,
            "fade-in slide-in-from-bottom-2 animate-in flex flex-col gap-2 rounded-md px-3.5 py-2.5 duration-300",
          )}
        >
          <div className="flex items-center gap-2">
            <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
            <span className="flex-1 truncate text-base">{summaryAgent.name}</span>
            <span className={cn(mono, "text-muted-foreground")}>{summaryAgent.model}</span>
          </div>
          <Progress aria-label={`${summaryAgent.name} progress`} value={null} />
        </div>
      )}
    </div>
  );
}

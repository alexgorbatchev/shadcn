import { Switch } from "../../Switch.js";
import type { JSX } from "react";
type ScheduleCardProps = Omit<
  ComponentProps<"div">,
  "children" | "name" | "cadence" | "nextRun" | "enabled" | "history" | "onToggle"
> & {
  name: string;
  cadence: string;
  nextRun: string;
  enabled: boolean;
  history: readonly IScheduleRun[];
  onToggle?: () => void;
};
import type { ComponentProps } from "react";
import { CheckIcon, ClockIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
export interface IScheduleRun {
  id: string;
  at: string;
  ok: boolean;
}
export function ScheduleCard({
  name,
  cadence,
  nextRun,
  enabled,
  history,
  onToggle,
  className,
  ...props
}: ScheduleCardProps): JSX.Element {
  return (
    <div
      data-testid="ScheduleCard"
      data-slot="schedule-card"
      data-scroll="none"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-4"), className)}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        <ClockIcon aria-hidden="true" className={cn("size-4")} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-medium">{name}</span>
          <span className={cn(mono, "text-muted-foreground")}>{cadence}</span>
        </div>
        <Switch
          checked={enabled}
          disabled={!onToggle}
          aria-label={`${enabled ? "Pause" : "Resume"} ${name}`}
          onCheckedChange={onToggle}
        />
      </div>

      <div className={cn(field, "flex items-baseline gap-2 rounded-md px-3 py-2", !enabled && "border-dashed")}>
        <span className={cn(mono, "text-muted-foreground")}>next</span>
        <span className="text-foreground text-base">{enabled ? nextRun : "paused"}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn(mono, "text-muted-foreground")}>recent runs</span>
        {history.map((run) => (
          <div key={run.id} className="flex items-baseline gap-2">
            {run.ok ? (
              <CheckIcon aria-hidden="true" className={cn("size-4")} />
            ) : (
              <XIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
            )}
            <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">{run.at}</span>
            <span className={cn(mono, "text-muted-foreground shrink-0")}>{run.ok ? "ok" : "failed"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

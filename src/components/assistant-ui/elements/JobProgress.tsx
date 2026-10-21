import { Button } from "../../Button.js";
import { Progress } from "../../Progress.js";
import { formatJobElapsed } from "../utils/formatJobElapsed.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { CheckIcon, CircleAlertIcon, CircleSlashIcon, Loader2Icon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
import { clamp, pct, progressOf, take } from "../utils/range.js";
export interface IJobStage {
  name: string;
  weight: number;
  description?: string | undefined;
}
type JobOutcomeStatus = "success" | "partial" | "failed" | "cancelled";
export function JobProgress({
  title,
  stages,
  stageIndex,
  stageProgress,
  eta,
  onCancel,
  outcome,
  elapsedMs,
  ...props
}: IJobProgressProps): JSX.Element {
  const stage = progressOf(stageIndex, stages.length);
  const progress = clamp(stageProgress, 0, 1);
  const totalWeight = stages.reduce((sum, item) => sum + item.weight, 0) || 1;
  const completed = take(stages, stage).reduce((sum, item) => sum + item.weight, 0);
  const current = stages[stage];
  const overall = pct(completed + (current ? current.weight * progress : 0), totalWeight);
  const finished = stage >= stages.length;
  const running = !finished && outcome === undefined;
  const state = outcome?.status ?? (finished ? "done" : "running");
  const elapsed = !running && elapsedMs !== undefined ? formatJobElapsed(elapsedMs) : undefined;
  const statusWord = outcome?.status === "success" ? "done" : (outcome?.status ?? "done");
  const announcement = outcome
    ? `Job ${outcome.status === "success" ? "done" : outcome.status === "partial" ? "partly done" : outcome.status}`
    : current
      ? `Current stage: ${current.name}`
      : finished
        ? "Job done"
        : "Job running";
  const progressPercent = outcome?.status === "success" ? 100 : overall;
  return (
    <div
      data-testid="JobProgress"
      data-slot="job-progress"
      data-state={state}
      className={cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-4")}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        {outcome?.status === "partial" ? (
          <CircleAlertIcon aria-hidden="true" className={cn("size-4")} />
        ) : outcome?.status === "failed" ? (
          <XIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
        ) : outcome?.status === "cancelled" ? (
          <CircleSlashIcon aria-hidden="true" className={cn("size-4")} />
        ) : !running ? (
          <CheckIcon aria-hidden="true" className={cn("size-4", "text-success")} />
        ) : (
          <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
        )}
        <span className="min-w-0 flex-1 truncate text-base font-medium">{title}</span>
        <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
          {elapsed ? <time dateTime={elapsed.dateTime}>{elapsed.label}</time> : !running ? statusWord : eta}
        </span>
        {running && onCancel ? (
          <Button variant="ghost" aria-label="Cancel the job" onClick={onCancel} size="icon">
            <XIcon aria-hidden="true" data-icon="inline-start" />
          </Button>
        ) : null}
      </div>

      <Progress
        aria-label={`${title} progress`}
        value={progressPercent}
        tone={
          outcome?.status === "partial"
            ? "warning"
            : outcome?.status === "failed"
              ? "destructive"
              : outcome?.status === "cancelled"
                ? "muted"
                : !running
                  ? "success"
                  : "primary"
        }
      />

      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {stages.map((item, i) => (
            <span key={item.name} className={cn(mono, i === stage ? "text-foreground/90" : "text-muted-foreground")}>
              {item.name}
            </span>
          ))}
        </div>
        {current?.description ? (
          <p className="text-muted-foreground text-sm leading-4 break-words">{current.description}</p>
        ) : null}
      </div>
      {outcome?.summary ? (
        <p className="text-foreground/60 text-base leading-snug break-words">{outcome.summary}</p>
      ) : null}
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
interface IJobProgressProps extends Omit<
  Omit<
    ComponentProps<"div">,
    "children" | "title" | "stages" | "stageIndex" | "stageProgress" | "eta" | "onCancel" | "outcome" | "elapsedMs"
  >,
  "className" | "style"
> {
  title: string;
  stages: readonly IJobStage[];
  stageIndex: number;
  stageProgress: number;
  eta: string;
  onCancel?: (() => void) | undefined;
  outcome?: IJobOutcome;
  elapsedMs?: number | undefined;
}
interface IJobOutcome {
  status: JobOutcomeStatus;
  summary?: string;
}

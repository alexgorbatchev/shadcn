import type { JSX } from "react";
type TraceWaterfallProps = Omit<ComponentProps<"div">, "children" | "spans" | "totalMs" | "visibleCount"> & {
  spans: readonly ITraceSpan[];
  totalMs: number;
  visibleCount: number;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { pct, take } from "../utils/range.js";
export type SpanStatus = "running" | "completed" | "failed";
export interface ITraceSpan {
  id: string;
  name: string;
  depth: number;
  startMs: number;
  durationMs: number;
  status: SpanStatus;
}
const TONE: Record<SpanStatus, string> = {
  running: "bg-primary bg-primary",
  completed: "bg-foreground/35",
  failed: "bg-destructive/80",
};
export function TraceWaterfall({
  spans,
  totalMs,
  visibleCount,
  className,
  ...props
}: TraceWaterfallProps): JSX.Element {
  const span = totalMs || 1;
  return (
    <div
      data-testid="TraceWaterfall"
      data-slot="trace-waterfall"
      className={cn(cn(paper, "flex w-full max-w-md flex-col gap-2 rounded-md p-4"), className)}
      {...props}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-base font-medium">Trace</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>{totalMs}ms</span>
      </div>

      <div className="flex flex-col gap-1">
        {take(spans, visibleCount).map((item) => {
          const left = pct(item.startMs, span);
          const width = Math.max(1.5, pct(item.durationMs, span));
          return (
            <div
              key={item.id}
              className="fade-in slide-in-from-left-1 animate-in fill-mode-both grid grid-cols-[7.5rem_1fr_28px] items-center gap-2 duration-300"
            >
              <span
                className="text-muted-foreground min-w-0 truncate text-sm"
                style={{ paddingInlineStart: `${item.depth * 0.75}rem` }}
              >
                {item.name}
              </span>
              <span
                role="img"
                aria-label={`${item.status}, starts at ${item.startMs}ms, runs ${item.durationMs}ms`}
                className="relative flex h-4 min-w-0 items-center"
              >
                <span
                  className={cn(
                    "absolute h-[7px] rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
                    TONE[item.status],
                    item.status === "running" && "animate-pulse",
                  )}
                  style={{ insetInlineStart: `${left}%`, width: `${width}%` }}
                />
              </span>
              <span className={cn(mono, "text-muted-foreground text-end tabular-nums")}>{item.durationMs}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

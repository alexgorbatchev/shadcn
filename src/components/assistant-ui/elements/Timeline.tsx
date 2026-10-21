import type { JSX } from "react";
type TimelineProps = Omit<ComponentProps<"div">, "children" | "events" | "visibleCount"> & {
  events: readonly ITimelineEvent[];
  visibleCount: number;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { take } from "../utils/range.js";
export type TimelineWhen = "past" | "now" | "future";
export interface ITimelineEvent {
  id: string;
  when: TimelineWhen;
  time: string;
  title: string;
  detail?: string;
}
export function Timeline({ events, visibleCount, className, ...props }: TimelineProps): JSX.Element {
  return (
    <div
      data-testid="Timeline"
      data-slot="timeline"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col rounded-md p-4"), className)}
      {...props}
    >
      {take(events, visibleCount).map((event, i, shown) => (
        <div
          key={event.id}
          className="fade-in slide-in-from-left-1 animate-in fill-mode-both grid grid-cols-[3.5rem_1rem_minmax(0,1fr)] gap-x-2 duration-300"
        >
          <span className={cn(mono, "text-muted-foreground pt-[3px] text-end tabular-nums")}>{event.time}</span>

          <span className="flex flex-col items-center">
            <span
              className={cn(
                "mt-1 size-2 shrink-0 rounded-full",
                event.when === "now" && "bg-primary ring-4 ring-primary/15 bg-primary forced-colors:bg-[Highlight]",
                event.when === "past" && "bg-muted-foreground forced-colors:bg-[CanvasText]",
                event.when === "future" && "border-muted-foreground border bg-transparent",
              )}
            />
            {i < shown.length - 1 && (
              <span
                className={cn("w-px flex-1", event.when === "future" ? "bg-foreground/[0.08]" : "bg-foreground/15")}
              />
            )}
          </span>

          <div className={cn("flex flex-col gap-0.5", i < shown.length - 1 && "pb-3")}>
            <span
              className={cn(
                "text-base break-words",
                event.when === "future" ? "text-muted-foreground" : "text-foreground",
                event.when === "now" && "font-medium",
              )}
            >
              {event.title}
            </span>
            {event.detail && (
              <span className="text-muted-foreground text-sm leading-relaxed break-words">{event.detail}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

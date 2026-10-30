import type { ComponentProps, JSX, ReactNode } from "react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { take } from "../utils/range.js";
export type TimelineWhen = "past" | "now" | "future";
export interface ITimelineEvent {
  id: string;
  /** Progress state; omit it for a neutral entry, such as a planned item without a current position. */
  when?: TimelineWhen;
  time?: string;
  title: ReactNode;
  detail?: ReactNode;
  /** Supplementary content below the detail, such as badges. */
  meta?: ReactNode;
  /** Controls for this event, such as a menu button. */
  actions?: ReactNode;
  /** Annotation for the segment between this event and the next visible one, such as travel time. */
  connector?: ReactNode;
}
type TimelineProps = Omit<ComponentProps<"ol">, "children"> & {
  events: readonly ITimelineEvent[];
  /** Number of leading events to show; defaults to all of them. */
  visibleCount?: number;
  /** Span the container's width instead of the compact card width. */
  fullWidth?: boolean;
};
export function Timeline({
  events,
  visibleCount = events.length,
  fullWidth = false,
  className,
  ...props
}: TimelineProps): JSX.Element {
  const shown = take(events, visibleCount);
  const hasTime = shown.some((event) => event.time !== undefined);
  return (
    <ol
      data-testid="Timeline"
      data-slot="timeline"
      className={cn(
        paper,
        "grid w-full gap-x-2 rounded-md p-4",
        hasTime ? "grid-cols-[auto_1rem_minmax(0,1fr)]" : "grid-cols-[1rem_minmax(0,1fr)]",
        !fullWidth && "max-w-sm",
        className,
      )}
      {...props}
    >
      {shown.map((event, i) => {
        const isLast = i === shown.length - 1;
        return (
          <li
            key={event.id}
            aria-current={event.when === "now" ? "step" : undefined}
            className="fade-in slide-in-from-left-1 animate-in fill-mode-both col-span-full grid grid-cols-subgrid duration-300"
          >
            {hasTime && (
              <span className={cn(mono, "text-muted-foreground pt-[3px] text-end whitespace-nowrap tabular-nums")}>
                {event.time}
              </span>
            )}

            <span aria-hidden="true" className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full",
                  event.when === "now" && "bg-primary ring-4 ring-primary/15 forced-colors:bg-[Highlight]",
                  event.when === "past" && "bg-muted-foreground forced-colors:bg-[CanvasText]",
                  event.when === "future" && "border-muted-foreground border bg-transparent",
                  event.when === undefined && "bg-foreground forced-colors:bg-[CanvasText]",
                )}
              />
              {!isLast && (
                <span
                  className={cn("w-px flex-1", event.when === "future" ? "bg-foreground/[0.08]" : "bg-foreground/15")}
                />
              )}
            </span>

            <div className={cn("flex min-w-0 items-start gap-2", !isLast && "pb-3")}>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div
                  className={cn(
                    "text-base break-words",
                    event.when === "future" ? "text-muted-foreground" : "text-foreground",
                    event.when === "now" && "font-medium",
                  )}
                >
                  {event.title}
                </div>
                {event.detail !== undefined && (
                  <div className="text-muted-foreground text-sm leading-relaxed break-words">{event.detail}</div>
                )}
                {event.meta !== undefined && (
                  <div data-slot="timeline-meta" className="flex flex-wrap items-center gap-control-gap pt-1">
                    {event.meta}
                  </div>
                )}
                {!isLast && event.connector !== undefined && (
                  <div
                    data-slot="timeline-connector"
                    className="text-muted-foreground flex flex-wrap items-center gap-1.5 pt-2 text-xs break-words"
                  >
                    {event.connector}
                  </div>
                )}
              </div>
              {event.actions !== undefined && (
                <div data-slot="timeline-actions" className="flex shrink-0 items-center gap-control-gap">
                  {event.actions}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

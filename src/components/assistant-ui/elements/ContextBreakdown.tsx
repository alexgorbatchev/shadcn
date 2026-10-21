import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
import { announced, pct } from "../utils/range.js";
import { ShareMeter } from "./ShareMeter.js";
const fmt = (n: number) => n.toLocaleString("en-US");
export interface IContextSegment {
  label: string;
  tokens: number;
  tone: ContextSegmentTone;
}
type ContextSegmentTone = "primary" | "success" | "warning" | "muted";
const segmentTones: Record<ContextSegmentTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  muted: "bg-muted-foreground",
};
export function ContextBreakdown({
  segments,
  limit,
  variant = "default",
  ...props
}: IContextBreakdownProps): JSX.Element {
  const used = segments.reduce((sum, segment) => sum + segment.tokens, 0);
  const pressure = limit === 0 ? 0 : used / limit;
  const share = (tokens: number) => pct(tokens, limit);
  return (
    <div
      data-testid="ContextBreakdown"
      data-slot="context-breakdown"
      className={cn(
        "flex w-full flex-col gap-2",
        variant === "default" ? cn(paper, "max-w-sm rounded-md p-2") : "text-popover-foreground",
      )}
      {...props}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-base font-medium">Context</span>
        <span
          className={cn(mono, "tabular-nums", pressure > 0.85 ? "text-warning text-warning" : "text-muted-foreground")}
        >
          {fmt(used)} / {fmt(limit)}
        </span>
      </div>

      <div className="flex w-full flex-col gap-1">
        {segments.map((segment) => {
          const width = share(segment.tokens);
          if (announced(width) === 0) return null;
          return (
            <ShareMeter
              key={segment.label}
              label={`${segment.label} context usage`}
              percentage={width}
              valueText={`${fmt(segment.tokens)} of ${fmt(limit)}`}
              tone={segment.tone}
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full forced-color-adjust-none", segmentTones[segment.tone])}
            />
            <span className="text-foreground/70 min-w-0 flex-1 truncate text-base">{segment.label}</span>
            <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>{fmt(segment.tokens)}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="bg-foreground/[0.08] inset-ring-border size-2 shrink-0 rounded-full inset-ring forced-colors:border"
          />
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-base">Headroom</span>
          <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
            {fmt(Math.max(0, limit - used))}
          </span>
        </div>
      </div>
    </div>
  );
}
interface IContextBreakdownProps extends Omit<
  ComponentProps<"div">,
  "children" | "segments" | "limit" | "className" | "style"
> {
  segments: readonly IContextSegment[];
  limit: number;
  variant?: "default" | "embedded";
}

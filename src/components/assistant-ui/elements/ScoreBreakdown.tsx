import { ShareMeter } from "./ShareMeter.js";
import { Badge } from "../../Badge.js";
import type { JSX } from "react";
type ScoreBreakdownProps = Omit<
  ComponentProps<"div">,
  "children" | "verdict" | "total" | "outOf" | "criteria" | "visibleCount"
> & {
  verdict: string;
  total: number;
  outOf: number;
  criteria: readonly IScoreCriterion[];
  visibleCount: number;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { announced, pct, take } from "../utils/range.js";
export interface IScoreCriterion {
  label: string;
  score: number;
  weight: number;
  note?: string;
}
export function ScoreBreakdown({
  verdict,
  total,
  outOf,
  criteria,
  visibleCount,
  className,
  ...props
}: ScoreBreakdownProps): JSX.Element {
  const ratio = outOf === 0 ? 0 : total / outOf;
  return (
    <div
      data-testid="ScoreBreakdown"
      data-slot="score-breakdown"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-4"), className)}
      {...props}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-medium tracking-tight tabular-nums">{total.toFixed(1)}</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>/ {outOf}</span>
        <Badge variant={ratio >= 0.75 ? "success" : ratio >= 0.5 ? "warning" : "destructive"}>{verdict}</Badge>
      </div>

      <div className="flex flex-col gap-2">
        {take(criteria, visibleCount).map((criterion) => (
          <div
            key={criterion.label}
            className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex flex-col gap-1 duration-300"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground min-w-0 flex-1 truncate text-base">{criterion.label}</span>
              <span className={cn(mono, "text-muted-foreground shrink-0")}>×{criterion.weight}</span>
              <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
                {criterion.score.toFixed(1)}
              </span>
            </div>
            <ShareMeter
              label={`${criterion.label} score`}
              percentage={announced(pct(criterion.score, outOf))}
              valueText={`${criterion.score.toFixed(1)} of ${outOf}`}
            />
            {criterion.note && (
              <span className="text-muted-foreground text-sm leading-relaxed break-words">{criterion.note}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

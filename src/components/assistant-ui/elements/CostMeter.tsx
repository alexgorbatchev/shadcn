import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
import { announced, pct } from "../utils/range.js";
import { formatTokenCount } from "../utils/tokens.js";
import { ShareMeter } from "./ShareMeter.js";
export interface ICostLine {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: string;
  share: number;
}
export function CostMeter({ runCost, sessionCost, lines, ...props }: ICostMeterProps): JSX.Element {
  return (
    <div
      data-testid="CostMeter"
      data-slot="cost-meter"
      className={cn(paper, "flex w-full max-w-sm flex-col gap-2 rounded-md p-2")}
      {...props}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-medium tracking-tight tabular-nums">{runCost}</span>
        <span className={cn(mono, "text-muted-foreground")}>this run</span>
        <span className={cn(mono, "text-muted-foreground ms-auto tabular-nums")}>{sessionCost} session</span>
      </div>

      <div className="flex w-full flex-col gap-1">
        {lines.map((line) => {
          const width = pct(line.share, 1);
          if (announced(width) === 0) return null;
          return (
            <ShareMeter
              key={line.model}
              label={`${line.model} cost share`}
              percentage={width}
              valueText={`${announced(width)}% of run cost`}
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        {lines.map((line) => (
          <div key={line.model} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-foreground/75 min-w-0 grow truncate text-base">{line.model}</span>
            <span className="ms-auto flex min-w-0 items-baseline gap-2">
              <span className={cn(mono, "text-muted-foreground truncate tabular-nums")}>
                {formatTokenCount(line.inputTokens)} in · {formatTokenCount(line.outputTokens)} out
              </span>
              <span className={cn(mono, "text-foreground/75 shrink-0 tabular-nums")}>{line.cost}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
interface ICostMeterProps extends Omit<
  ComponentProps<"div">,
  "children" | "runCost" | "sessionCost" | "lines" | "className" | "style"
> {
  runCost: string;
  sessionCost: string;
  lines: readonly ICostLine[];
}

import { ShareMeter } from "./ShareMeter.js";
import { Button } from "../../Button.js";
import type { JSX } from "react";
type QuotaBannerProps = Omit<
  ComponentProps<"div">,
  "children" | "used" | "limit" | "unit" | "resetsIn" | "upgradeLabel" | "onUpgrade"
> & {
  used: number;
  limit: number;
  unit: string;
  resetsIn: string;
  upgradeLabel: string;
  onUpgrade?: () => void;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { announced, pct } from "../utils/range.js";
export function QuotaBanner({
  used,
  limit,
  unit,
  resetsIn,
  upgradeLabel,
  onUpgrade,
  className,
  ...props
}: QuotaBannerProps): JSX.Element {
  const left = Math.max(0, limit - used);
  const ratio = limit === 0 ? 0 : used / limit;
  const exhausted = limit > 0 && left === 0;
  const tight = !exhausted && ratio >= 0.9;
  return (
    <div
      data-testid="QuotaBanner"
      data-slot="quota-banner"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-2.5 rounded-md p-3.5"), className)}
      {...props}
    >
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "text-base font-medium",
            exhausted && "text-destructive text-destructive",
            tight && "text-warning text-warning",
          )}
        >
          {left} {unit} left
        </span>
        <span className={cn(mono, "text-muted-foreground ms-auto tabular-nums")}>resets in {resetsIn}</span>
      </div>

      <ShareMeter
        label={`${unit} used`}
        percentage={announced(pct(used, limit))}
        valueText={`${used} of ${limit} ${unit} used`}
        tone={exhausted ? "destructive" : tight ? "warning" : "muted"}
      />

      <div className="flex items-center gap-2">
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {used} of {limit} used
        </span>
        <Button type="button" onClick={onUpgrade} variant="default">
          {upgradeLabel}
        </Button>
      </div>
    </div>
  );
}

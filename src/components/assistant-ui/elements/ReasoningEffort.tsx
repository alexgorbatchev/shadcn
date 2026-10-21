import { Progress } from "../../Progress.js";
import { ToggleGroup, ToggleGroupItem } from "../../ToggleGroup.js";
import type { JSX } from "react";
type ReasoningEffortProps = Omit<
  ComponentProps<"div">,
  "children" | "levels" | "selectedKey" | "spent" | "onSelect"
> & {
  levels: readonly IEffortLevel[];
  selectedKey: string;
  spent: number;
  onSelect?: (key: string) => void;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { field, mono } from "./constants.js";
import { announced, pct } from "../utils/range.js";
const fmt = (n: number) => n.toLocaleString("en-US");
export interface IEffortLevel {
  key: string;
  label: string;
  budget: number;
}
export function ReasoningEffort({
  levels,
  selectedKey,
  spent,
  onSelect,
  className,
  ...props
}: ReasoningEffortProps): JSX.Element {
  const selected = levels.find((level) => level.key === selectedKey);
  const budget = selected?.budget ?? 0;
  const used = pct(spent, budget);
  return (
    <div
      data-testid="ReasoningEffort"
      data-slot="reasoning-effort"
      className={cn(cn("flex w-full max-w-sm flex-col gap-2.5"), className)}
      {...props}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-base font-medium">Thinking</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {fmt(spent)} / {fmt(budget)}
        </span>
      </div>

      {onSelect ? (
        <ToggleGroup
          value={[selectedKey]}
          onValueChange={(keys) => {
            const key = keys[0];
            if (key) onSelect(key);
          }}
          aria-label="Thinking effort"
          variant="outline"
          spacing={0}
        >
          {levels.map((level) => (
            <ToggleGroupItem key={level.key} value={level.key}>
              {level.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : (
        <div className={cn(field, "grid auto-cols-fr grid-flow-col gap-0.5 rounded-sm p-0.5")}>
          {levels.map((level) => (
            <span
              key={level.key}
              aria-current={level.key === selectedKey ? "true" : undefined}
              className={cn(
                "px-2 py-1 text-center text-sm",
                level.key === selectedKey ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
            >
              {level.label}
            </span>
          ))}
        </div>
      )}

      <Progress
        aria-label="Thinking budget used"
        value={announced(used)}
        aria-valuetext={`${fmt(spent)} of ${fmt(budget)}`}
      />
    </div>
  );
}

import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { collapsePanel } from "./constants.js";
import { cn } from "../../../utils/cn.js";
import type { JSX } from "react";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";
import { Collapsible } from "../../Collapsible.js";
import { CollapsibleContent } from "../../Collapsible.js";
import { CollapsibleTrigger } from "../../Collapsible.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
import { SwapLabel } from "./SwapLabel.js";
import { take } from "../utils/range.js";
export interface ITimelineStep {
  id?: string;
  verb: string;
  chip: string;
  icon: LucideIcon;
}
export interface ITimelineStat {
  file: string;
  added?: number;
  removed?: number;
}
export interface IToolTimelineProps {
  steps: readonly ITimelineStep[];
  visibleSteps: number;
  streaming: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restingLabel: string;
  activeLabel: string;
  stats: ITimelineStat[];
}
export function ToolTimeline({
  steps,
  visibleSteps,
  streaming,
  open,
  onOpenChange,
  restingLabel,
  activeLabel,
  stats,
}: IToolTimelineProps): JSX.Element {
  return (
    <Collapsible
      data-testid="ToolTimeline"
      data-slot="tool-timeline"
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      render={<div className={cn("w-full max-w-sm")} />}
    >
      <CollapsibleTrigger
        render={
          <AnalyticsButton
            component="ToolTimeline"
            type="button"
            className="group/trigger text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-md py-1 text-[13.5px] transition-colors outline-none"
          />
        }
      >
        <ChevronRightIcon aria-hidden="true" className={cn("size-4")} />
        <SwapLabel active={streaming ? 0 : 1}>
          <ShimmerLabel active={streaming}>{activeLabel}</ShimmerLabel>
          <>{restingLabel}</>
        </SwapLabel>
      </CollapsibleTrigger>
      <CollapsibleContent render={<div className={cn(collapsePanel, "outline-none")} />}>
        <div className="flex flex-col gap-2.5 ps-4 pt-2.5">
          {take(steps, visibleSteps).map((step, index, shown) => {
            const Glyph = step.icon;
            const active = streaming && index === shown.length - 1;
            return (
              <div
                key={step.id ? `id:${step.id}` : index}
                className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground flex items-center gap-2 text-base duration-300"
              >
                <Glyph aria-hidden="true" className={cn("size-4")} />
                <ShimmerLabel active={active}>{step.verb}</ShimmerLabel>
                <span className="bg-foreground/[0.06] text-muted-foreground rounded-md px-1.5 py-0.5 font-mono text-[11px]">
                  {step.chip}
                </span>
              </div>
            );
          })}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {stats.map((stat) => (
                <span
                  key={stat.file}
                  className="bg-foreground/[0.06] text-muted-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px]"
                >
                  <span>{stat.file}</span>
                  {stat.added !== undefined && <span className="text-success text-success">+{stat.added}</span>}
                  {stat.removed !== undefined && (
                    <span className="text-destructive text-destructive">−{stat.removed}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

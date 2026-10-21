import { collapsePanel } from "./constants.js";
import type { JSX } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
import { SwapLabel } from "./SwapLabel.js";
import { Collapsible } from "../../Collapsible.js";
import { CollapsibleContent } from "../../Collapsible.js";
import { CollapsibleTrigger } from "../../Collapsible.js";
import { take } from "../utils/range.js";
export interface IReasoningStep {
  title: string;
  body: string;
}
export interface IReasoningPanelProps {
  steps: IReasoningStep[];
  visibleSteps: number;
  streaming: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restingLabel: string;
  elapsed?: string;
}
export function ReasoningPanel({
  steps,
  visibleSteps,
  streaming,
  open,
  onOpenChange,
  restingLabel,
  elapsed,
}: IReasoningPanelProps): JSX.Element {
  const shown = take(steps, visibleSteps);
  return (
    <Collapsible
      data-testid="ReasoningPanel"
      data-slot="reasoning-panel"
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      render={<div className={cn("w-full max-w-sm")} />}
    >
      <CollapsibleTrigger
        render={
          <button
            type="button"
            className="group/trigger text-muted-foreground hover:text-foreground flex items-center gap-1.5 py-1 text-[13.5px] transition-colors outline-none"
          />
        }
      >
        <SwapLabel active={streaming ? 0 : 1}>
          <>
            <ShimmerLabel active={streaming}>Thinking</ShimmerLabel>
            {elapsed !== undefined && <span className={cn(mono, "text-muted-foreground tabular-nums")}>{elapsed}</span>}
          </>
          <>{restingLabel}</>
        </SwapLabel>
        <ChevronDownIcon aria-hidden="true" className={cn("size-4")} />
      </CollapsibleTrigger>
      <CollapsibleContent render={<div className={cn(collapsePanel, "outline-none")} />}>
        <ol className="flex flex-col gap-4 pt-3 pb-1">
          {shown.map((step, i) => {
            const active = streaming && i === shown.length - 1;
            return (
              <li
                key={step.title}
                className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex gap-3 duration-300"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-[7px] size-[5px] shrink-0 rounded-full transition-colors duration-300",
                    active ? "animate-pulse bg-primary bg-primary" : "bg-foreground/20",
                  )}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <p className="text-foreground text-base font-medium">{step.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-base leading-relaxed break-words">{step.body}</p>
                </span>
              </li>
            );
          })}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}

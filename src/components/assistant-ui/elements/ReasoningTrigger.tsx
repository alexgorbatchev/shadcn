import type { ComponentProps } from "react";
import type { JSX } from "react";
import { BrainIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { CollapsibleTrigger } from "../../Collapsible.js";
type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  active?: boolean;
  duration?: number | undefined;
};
export function ReasoningTrigger({ active, duration, className, ...props }: ReasoningTriggerProps): JSX.Element {
  const durationText = duration ? ` (${duration}s)` : "";
  return (
    <CollapsibleTrigger
      data-testid="ReasoningTrigger"
      data-slot="reasoning-trigger"
      {...props}
      className={(state) =>
        cn(
          "aui-reasoning-trigger group/trigger text-muted-foreground hover:text-foreground flex max-w-[75%] items-center gap-2 py-1.5 text-sm transition-colors motion-reduce:transition-none",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <BrainIcon aria-hidden="true" className={cn("size-4")} />
      <span
        data-slot="reasoning-trigger-label"
        className={cn(
          "aui-reasoning-trigger-label-wrapper inline-block leading-none tabular-nums",
          active && "shimmer motion-reduce:animate-none",
        )}
      >
        Reasoning{durationText}
      </span>
      <ChevronDownIcon aria-hidden="true" className={cn("size-4")} />
    </CollapsibleTrigger>
  );
}

import { Progress } from "../../Progress.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { pct, progressOf } from "../utils/range.js";
export interface IAgentPlanStep {
  id?: string | undefined;
  label: string;
  description?: string | undefined;
}
export function AgentPlan({ steps, activeIndex, title = "Plan", ...props }: IAgentPlanProps): JSX.Element {
  const total = steps.length;
  const completed = progressOf(activeIndex, total);
  const allDone = completed >= total;
  const progress = pct(completed, total);
  return (
    <div
      data-testid="AgentPlan"
      data-slot="agent-plan"
      className={cn("flex w-full max-w-sm flex-col gap-3")}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">{title}</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {completed} of {total}
        </span>
      </div>
      <Progress aria-label={`${title} progress`} value={progress} aria-valuetext={`${completed} of ${total} steps`} />
      <ul className="flex flex-col gap-2.5">
        {steps.map((step, i) => {
          const item = typeof step === "string" ? { label: step } : step;
          const done = allDone || i < completed;
          const active = !allDone && i === completed;
          const status = done ? "done" : active ? "in progress" : "not started";
          return (
            <li
              key={typeof step === "string" ? i : (step.id ?? i)}
              className={cn("flex gap-2.5 text-base", active && item.description ? "items-start" : "items-center")}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {done ? (
                  <CheckIcon aria-hidden="true" className={cn("size-4")} />
                ) : active ? (
                  <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
                ) : (
                  <span
                    aria-hidden
                    className="bg-foreground/15 inset-ring-border size-1.5 rounded-full inset-ring forced-colors:border"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    done && "text-muted-foreground",
                    active && "text-foreground/90",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
                <span className="sr-only">{` ${status}`}</span>
                {active && item.description ? (
                  <span className="text-muted-foreground mt-0.5 block text-sm">{item.description}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
interface IAgentPlanProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "steps" | "activeIndex">,
  "className" | "style"
> {
  steps: readonly (string | IAgentPlanStep)[];
  activeIndex: number;
  title?: string | undefined;
}

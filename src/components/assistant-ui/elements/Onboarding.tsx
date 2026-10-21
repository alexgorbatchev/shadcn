import { Button } from "../../Button.js";
import type { JSX } from "react";
type OnboardingProps = Omit<ComponentProps<"div">, "children" | "steps" | "index" | "onNext" | "onSkip"> & {
  steps: readonly IOnboardingStep[];
  index: number;
  onNext?: () => void;
  onSkip?: () => void;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
import { indexIn } from "../utils/range.js";
export interface IOnboardingStep {
  title: string;
  body: string;
  example: string;
}
export function Onboarding({ steps, index, onNext, onSkip, className, ...props }: OnboardingProps): JSX.Element | null {
  const current = indexIn(steps, index);
  const step = steps[current];
  if (!step) return null;
  const last = current >= steps.length - 1;
  return (
    <div
      data-testid="Onboarding"
      data-slot="onboarding"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-4 rounded-md p-5"), className)}
      {...props}
    >
      <div key={current} className="fade-in animate-in flex flex-col gap-2 duration-300">
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {current + 1} of {steps.length}
        </span>
        <span className="text-[15px] font-medium tracking-tight">{step.title}</span>
        <p className="text-muted-foreground text-base leading-relaxed break-words">{step.body}</p>
        <span className={cn(field, "text-muted-foreground rounded-md px-3 py-2 text-base leading-relaxed")}>
          {step.example}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                "h-1 rounded-full transition-all duration-300 motion-reduce:transition-none",
                i === current ? "bg-foreground/60 w-4" : "bg-foreground/15 w-1",
              )}
            />
          ))}
        </span>

        <Button type="button" onClick={onSkip} variant="ghost">
          Skip
        </Button>
        <Button type="button" onClick={onNext} variant="default">
          {last ? "Start" : "Next"}
        </Button>
      </div>
    </div>
  );
}

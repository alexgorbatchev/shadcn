import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
import { take } from "../utils/range.js";
export interface IMathStep {
  expression: React.ReactNode;
  note?: string;
}
export function MathBlock({ label, steps, visibleSteps, ...props }: IMathBlockProps): JSX.Element {
  return (
    <div
      data-testid="MathBlock"
      data-slot="math-block"
      className={cn(paper, "flex w-full max-w-sm flex-col gap-2 rounded-md p-2")}
      {...props}
    >
      {label && <span className={cn(mono, "text-muted-foreground")}>{label}</span>}

      {take(steps, visibleSteps).map((step, i) => (
        <div
          key={i}
          className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex flex-col gap-1 duration-300"
        >
          <span className="text-foreground/90 overflow-x-auto py-1 text-center font-serif text-[17px] leading-relaxed italic">
            {step.expression}
          </span>
          {step.note && <span className={cn(mono, "text-muted-foreground text-center")}>{step.note}</span>}
        </div>
      ))}
    </div>
  );
}
interface IMathBlockProps extends Omit<
  ComponentProps<"div">,
  "children" | "label" | "steps" | "visibleSteps" | "className" | "style"
> {
  label?: string;
  steps: readonly IMathStep[];
  visibleSteps: number;
}

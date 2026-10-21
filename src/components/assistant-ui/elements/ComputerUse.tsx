import type { JSX } from "react";
import type { ComponentProps } from "react";
import { MousePointer2Icon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
import { at, indexIn } from "../utils/range.js";
export interface IComputerStep {
  id: string;
  action: string;
  target: string;
  x: number;
  y: number;
}
export function ComputerUse({ url, steps, activeIndex, children, ...props }: IComputerUseProps): JSX.Element {
  const index = indexIn(steps, activeIndex);
  const active = at(steps, index);
  const trail = steps.slice(Math.max(0, index - 2), index + 1);
  return (
    <div
      data-testid="ComputerUse"
      data-slot="computer-use"
      className={cn(paper, "flex w-full max-w-md flex-col overflow-hidden rounded-md")}
      {...props}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="flex shrink-0 gap-1">
          {["bg-destructive/50", "bg-warning/50", "bg-success/50"].map((tint) => (
            <span key={tint} aria-hidden className={cn("size-2 rounded-full", tint)} />
          ))}
        </span>
        <span className={cn(field, mono, "text-muted-foreground min-w-0 flex-1 truncate rounded-full px-2.5 py-1")}>
          {url}
        </span>
      </div>

      <div className="border-foreground/[0.07] relative min-h-[136px] overflow-hidden border-t">
        {children}

        <svg
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 size-full text-primary"
        >
          {trail.map((step, i) => (
            <circle
              key={step.id}
              cx={`${step.x}%`}
              cy={`${step.y}%`}
              r={4}
              fill="currentColor"
              opacity={0.18 * (i + 1)}
            />
          ))}
          {/* This cursor belongs to the image coordinate plane, so its native SVG x/y coordinates determine placement. */}
          {active ? <MousePointer2Icon x={`${active.x}%`} y={`${active.y}%`} size={14} fill="currentColor" /> : null}
        </svg>
      </div>

      {active && (
        <div className="border-foreground/[0.07] flex items-center gap-2 border-t px-3.5 py-2">
          <span className={cn(mono, "text-muted-foreground shrink-0")}>{active.action}</span>
          <span className="text-foreground/80 min-w-0 flex-1 truncate text-base">{active.target}</span>
          <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
            {index + 1}/{steps.length}
          </span>
        </div>
      )}
    </div>
  );
}
interface IComputerUseProps extends Omit<
  Omit<ComponentProps<"div">, "url" | "steps" | "activeIndex" | "children">,
  "className" | "style"
> {
  url: string;
  steps: readonly IComputerStep[];
  activeIndex: number;
  children: React.ReactNode;
}

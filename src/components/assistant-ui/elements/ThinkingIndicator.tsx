import type { JSX } from "react";
type ThinkingIndicatorProps = Omit<ComponentProps<"div">, "children" | "label" | "elapsed"> & {
  label: string;
  elapsed?: string;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
export function ThinkingIndicator({ label, elapsed, className, ...props }: ThinkingIndicatorProps): JSX.Element {
  return (
    <div
      data-testid="ThinkingIndicator"
      data-slot="thinking-indicator"
      className={cn(cn("text-muted-foreground flex items-center gap-2.5 text-sm"), className)}
      {...props}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary motion-reduce:animate-none bg-primary"
      />
      <ShimmerLabel key={label}>{label}</ShimmerLabel>
      {elapsed !== undefined && (
        <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>{elapsed}</span>
      )}
    </div>
  );
}

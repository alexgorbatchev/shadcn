import type { JSX } from "react";
type SpecSheetProps = Omit<ComponentProps<"div">, "children" | "title" | "subtitle" | "rows" | "visibleCount"> & {
  title: string;
  subtitle?: string;
  rows: readonly ISpecRow[];
  visibleCount: number;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { take } from "../utils/range.js";
export interface ISpecRow {
  label: string;
  value: string;
  emphasis?: boolean;
}
export function SpecSheet({ title, subtitle, rows, visibleCount, className, ...props }: SpecSheetProps): JSX.Element {
  return (
    <div
      data-testid="SpecSheet"
      data-slot="spec-sheet"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-4"), className)}
      {...props}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium">{title}</span>
        {subtitle && <span className="text-muted-foreground text-sm">{subtitle}</span>}
      </div>

      <div className="flex flex-col">
        {take(rows, visibleCount).map((row) => (
          <div
            key={row.label}
            className="border-foreground/[0.06] fade-in animate-in fill-mode-both flex items-baseline gap-3 border-t py-1.5 duration-300 first:border-t-0 first:pt-0"
          >
            <span className={cn(mono, "text-muted-foreground w-24 shrink-0")}>{row.label}</span>
            <span
              className={cn(
                "min-w-0 flex-1 text-end text-base tabular-nums",
                row.emphasis ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

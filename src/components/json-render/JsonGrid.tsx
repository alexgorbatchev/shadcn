import { type BaseComponentProps } from "@json-render/react";
import { cn } from "../../utils/cn.js";
import { type JsonProps } from "./catalog.js";

/** Tailwind spacing steps of each gap size, the same steps as `gap-2`, `gap-3`, `gap-4` and `gap-6`. */
const GAP_STEPS: Record<string, number> = { sm: 2, md: 3, lg: 4, xl: 6 };

/** The narrowest a column may get before the grid shows fewer columns. */
const DEFAULT_GRID_MIN_COLUMN_WIDTH = 240;

/**
 * A grid of at most `columns` equal columns, each at least `minColumnWidth` pixels wide: the grid shows
 * min(columns, floor(width / minColumnWidth)) columns of its own width, never fewer than one, so it stacks in a narrow
 * container (a phone, or a page column beside an open panel) instead of squeezing its cells.
 */
export const JsonGrid = ({ props, children }: BaseComponentProps<JsonProps<"Grid">>) => {
  const columns = Math.max(1, Math.min(6, props.columns ?? 1));
  const minWidth = props.minColumnWidth ?? DEFAULT_GRID_MIN_COLUMN_WIDTH;
  const gap = `calc(var(--spacing) * ${GAP_STEPS[props.gap ?? "md"] ?? 3})`;
  // Each track is at least the wider of the minimum width and an equal share of `columns`, which caps the count at
  // `columns`; a lone column may be narrower than the minimum so it never overflows the grid.
  const track = `minmax(min(100%, max(${minWidth}px, (100% - ${columns - 1} * ${gap}) / ${columns})), 1fr)`;
  return (
    <div
      data-slot="json-grid"
      className={cn("grid w-full min-w-0", props.className)}
      style={{ gap, gridTemplateColumns: `repeat(auto-fill, ${track})` }}
    >
      {children}
    </div>
  );
};

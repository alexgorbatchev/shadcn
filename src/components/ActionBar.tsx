import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn.js";

interface IActionBarProps extends ComponentProps<"div"> {
  /**
   * Sticks the bar to the bottom of its scrolling container while the content it ends continues below the visible area;
   * where the content ends, the bar rests in place.
   */
  sticky?: boolean;
  /** Set while the bar is stuck, for its compact form: tighter spacing and no resting top padding. */
  stuck?: boolean;
  /** The surface the bar covers while stuck, so content scrolling under it stays hidden. */
  surface?: "background" | "card";
  /**
   * A decorative meter along the bar's top edge, from 0 to 1. It is hidden from assistive technology: state the value in
   * text, because screen readers report progress changes on their own.
   */
  progress?: number;
}

/** The bar that ends a form or a task: its status, what its action does and the action, in rows. */
function ActionBar({
  sticky = false,
  stuck = false,
  surface = "background",
  progress,
  className,
  children,
  ...props
}: IActionBarProps): ReactElement {
  return (
    <div
      data-slot="action-bar"
      data-stuck={stuck || undefined}
      className={cn(
        "relative flex flex-col border-t border-border",
        sticky && "sticky bottom-0 z-10",
        surface === "card" ? "bg-card" : "bg-background",
        stuck ? "gap-1 py-2" : "gap-2 pt-panel",
        className,
      )}
      {...props}
    >
      {progress !== undefined && (
        <span
          aria-hidden="true"
          data-slot="action-bar-meter"
          className="absolute -top-px start-0 h-0.5 bg-primary forced-colors:bg-[CanvasText]"
          style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
        />
      )}
      {children}
    </div>
  );
}

interface IActionBarRowProps extends ComponentProps<"div"> {
  /** How the row distributes its items; `between` puts the last item, usually the primary action, at the end. */
  justify?: "start" | "between" | "end";
  /**
   * `end` aligns items to the row's bottom, so an action lines up with the last line of a multi-line status. `start`
   * aligns them to the top, so an action shares the centre line of the first row of a status group that wraps, when
   * that row's tallest item is the action's height.
   */
  align?: "center" | "start" | "end";
  /** Whether items wrap onto further lines; a one-row bar sets it false. */
  wrap?: boolean;
}

/** One row of an `ActionBar`. */
function ActionBarRow({
  justify = "start",
  align = "center",
  wrap = true,
  className,
  ...props
}: IActionBarRowProps): ReactElement {
  return (
    <div
      data-slot="action-bar-row"
      className={cn(
        "flex min-w-0 gap-x-4 gap-y-1 text-xs",
        wrap ? "flex-wrap" : "flex-nowrap",
        align === "end" ? "items-end" : align === "start" ? "items-start" : "items-center",
        justify === "between" ? "justify-between" : justify === "end" ? "justify-end" : "justify-start",
        className,
      )}
      {...props}
    />
  );
}

export { ActionBar, ActionBarRow };
export type { IActionBarProps, IActionBarRowProps };

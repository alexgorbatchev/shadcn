import type { ComponentProps, ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

const statusDotVariants = cva("inline-flex items-center gap-1 text-xs font-medium tabular-nums", {
  variants: {
    tone: {
      /** Something new or waiting on the reader. */
      primary: "text-primary",
      /** A quieter state, such as something already seen. */
      muted: "text-muted-foreground",
    },
    placement: {
      /** In the line of text, before or after a label. */
      inline: "",
      /** On the top end corner of a positioned parent, such as an icon button. */
      corner: "pointer-events-none absolute -top-0.5 -end-0.5",
    },
  },
  defaultVariants: { tone: "primary", placement: "inline" },
});

type StatusDotProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof statusDotVariants> & {
    /** A number beside the dot, such as the new items it rolls up; omitted for a single item. */
    count?: number;
  };

/**
 * A small status dot for "new" or "waiting", with an optional count. Drawn as an SVG fill in `currentColor`, so forced
 * colors keep it visible. It is decorative and hidden from assistive technology: say what it means in nearby text or
 * the control's accessible name.
 */
function StatusDot({ tone, placement, count, className, ...props }: StatusDotProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      data-slot="status-dot"
      data-tone={tone ?? "primary"}
      className={cn(statusDotVariants({ tone, placement }), className)}
      {...props}
    >
      <svg viewBox="0 0 8 8" className="size-2 shrink-0" focusable="false">
        <circle cx="4" cy="4" r="4" fill="currentColor" />
      </svg>
      {count !== undefined && <span data-slot="status-dot-count">{count}</span>}
    </span>
  );
}

export { StatusDot, statusDotVariants };
export type { StatusDotProps };

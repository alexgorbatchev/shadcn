import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useId } from "react";
import { XIcon } from "lucide-react";
import { cn } from "../utils/cn.js";
import { Button } from "./Button.js";

type FilterChipProps = Omit<ComponentProps<"div">, "children"> &
  IDensityProps & {
    /** What the active filter shows, such as "Showing 1 of 4 threads on ‘type scale’". It names the chip's group. */
    children: ReactNode;
    /** The action that clears the filter. */
    clearLabel?: string;
    /** Clears the filter: from the clear button, or Escape while focus is inside the chip. */
    onClear: () => void;
  };

/**
 * Says that a filter is active and how to clear it, so a filtered list never hides items silently. Escape while focus
 * is inside the chip clears the filter, like its clear button.
 */
function FilterChip({
  density,
  className,
  children,
  clearLabel = "Show all",
  onClear,
  onKeyDown,
  ...props
}: FilterChipProps): ReactElement {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-density={density}
      data-slot="filter-chip"
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 rounded-sm border border-border bg-muted ps-2 text-xs text-foreground",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onClear();
      }}
      {...props}
    >
      <span id={labelId} data-slot="filter-chip-label" className="min-w-0 py-1 break-words">
        {children}
      </span>
      <Button type="button" variant="ghost" size="xs" aria-keyshortcuts="Escape" onClick={onClear}>
        {clearLabel}
        <XIcon aria-hidden="true" data-icon="inline-end" />
      </Button>
    </div>
  );
}

export { FilterChip };
export type { FilterChipProps };

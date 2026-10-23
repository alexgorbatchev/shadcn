import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./Tooltip.js";
import { cn } from "../utils/cn.js";
type StatusTrackerItem = {
  id: string;
  label: string;
  status: "success" | "warning" | "error" | "unknown";
  description?: string;
};
type StatusTrackerProps = IDensityProps & {
  label: string;
  items: readonly StatusTrackerItem[];
  onItemSelect?: (item: StatusTrackerItem) => void;
};
const statusClasses = { success: "bg-success", warning: "bg-warning", error: "bg-destructive", unknown: "bg-muted" };
function StatusTracker({ label, items, onItemSelect, density }: StatusTrackerProps): ReactElement {
  return (
    <TooltipProvider>
      <div role="group" aria-label={label} data-density={density} className="flex min-w-0 gap-1">
        {items.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger
              aria-label={`${item.label}: ${item.status}`}
              onClick={() => onItemSelect?.(item)}
              className={cn(
                "h-8 min-w-2 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                statusClasses[item.status],
              )}
            />
            <TooltipContent>
              {item.label}: {item.description ?? item.status}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
export { StatusTracker };
export type { StatusTrackerProps, StatusTrackerItem };

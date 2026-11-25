import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsInput } from "../hooks/useAnalyticsInput.js";
import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn.js";

interface ITextareaOwnProps {
  /** Grow with the content up to 18rem, then scroll, so controls after a long text stay in view. */
  bounded?: boolean;
  /**
   * How tall the field starts: `default` leaves room for a few lines; `line` starts one line tall, as tall as an
   * input, and grows as text is typed, for short answers that may run long, such as a note.
   */
  startHeight?: "default" | "line";
}
type TextareaProps = IAnalyticsProps & ComponentProps<"textarea"> & IDensityProps & ITextareaOwnProps;

function Textarea({
  analytics,
  density,
  bounded = false,
  startHeight = "default",
  className,
  ...props
}: TextareaProps): ReactElement {
  const analyticsInput = useAnalyticsInput("Textarea", analytics, props);

  return (
    <textarea
      data-density={density}
      data-slot="textarea"
      data-start-height={startHeight}
      rows={startHeight === "line" ? 1 : undefined}
      className={cn(
        "flex field-sizing-content w-full rounded-sm border border-input bg-background px-control-x text-base transition-colors outline-none placeholder:text-faint-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive dark:bg-secondary",
        // One line: the input's padding, and a line height that fills the rest of the control height.
        startHeight === "line"
          ? "min-h-control resize-none py-1 leading-[calc(var(--ag-control-h)-10px)]"
          : "min-h-16 py-2",
        bounded && "max-h-72 overflow-y-auto",
        className,
      )}
      {...props}
      {...analyticsInput}
    />
  );
}

export { Textarea };

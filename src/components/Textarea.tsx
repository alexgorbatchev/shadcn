import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsInput } from "../hooks/useAnalyticsInput.js";
import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn.js";

interface ITextareaOwnProps {
  /** Grow with the content up to 18rem, then scroll, so controls after a long text stay in view. */
  bounded?: boolean;
}
type TextareaProps = IAnalyticsProps & ComponentProps<"textarea"> & IDensityProps & ITextareaOwnProps;

function Textarea({ analytics, density, bounded = false, className, ...props }: TextareaProps): ReactElement {
  const analyticsInput = useAnalyticsInput("Textarea", analytics, props);

  return (
    <textarea
      data-density={density}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-secondary px-control-x py-2 text-base transition-colors outline-none placeholder:text-faint-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive",
        bounded && "max-h-72 overflow-y-auto",
        className,
      )}
      {...props}
      {...analyticsInput}
    />
  );
}

export { Textarea };

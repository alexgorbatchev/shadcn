import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn";

type TextareaProps = ComponentProps<"textarea"> & IDensityProps;

function Textarea({ density, className, ...props }: TextareaProps): ReactElement {
  return (
    <textarea
      data-density={density}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-secondary px-control-x py-2 text-base transition-colors outline-none placeholder:text-faint-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

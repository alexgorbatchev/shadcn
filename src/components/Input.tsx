import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "../utils/cn";

type InputProps = ComponentProps<"input"> & IDensityProps;

function Input({ density, className, type, ...props }: InputProps): ReactElement | null {
  return (
    <InputPrimitive
      type={type}
      data-density={density}
      data-slot="input"
      className={cn(
        "h-control w-full min-w-0 rounded-sm border border-input bg-secondary px-control-x py-1 text-base transition-colors outline-none file:inline-flex file:h-control-xs file:border-0 file:bg-secondary file:text-sm file:font-medium file:text-foreground placeholder:text-faint-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

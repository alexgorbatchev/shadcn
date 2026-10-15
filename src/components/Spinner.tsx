import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "../utils/cn";

type SpinnerProps = ComponentProps<"svg"> & IDensityProps;

function Spinner({ density, className, ...props }: SpinnerProps): ReactElement {
  return (
    <Loader2Icon
      data-density={density}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

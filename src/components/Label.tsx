"use client";

import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn";

type LabelProps = ComponentProps<"label"> & IDensityProps;

function Label({ density, className, ...props }: LabelProps): ReactElement | null {
  return (
    <label
      data-density={density}
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };

import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn";

type SkeletonProps = ComponentProps<"div"> & IDensityProps;

function Skeleton({ density, className, ...props }: SkeletonProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

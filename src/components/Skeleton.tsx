import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn.js";

type SkeletonProps = ComponentProps<"div"> & IDensityProps;

function Skeleton({ density, className, ...props }: SkeletonProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };

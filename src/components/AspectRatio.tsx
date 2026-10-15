import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn.js";

export interface IAspectRatioProps extends ComponentProps<"div"> {
  ratio: number;
}

export function AspectRatio({ ratio, className, style, ...props }: IAspectRatioProps): ReactElement {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn("relative", className)}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    />
  );
}

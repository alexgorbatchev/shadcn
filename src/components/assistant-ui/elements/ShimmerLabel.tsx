import type { ComponentProps, ReactElement } from "react";
import { cn } from "../../../utils/cn.js";
interface IShimmerLabelProps extends Omit<ComponentProps<"span">, "className" | "style"> {
  active?: boolean;
}
export function ShimmerLabel({ active = true, ...props }: IShimmerLabelProps): ReactElement {
  return (
    <span
      data-testid="ShimmerLabel"
      className={cn("relative inline-block text-muted-foreground", active && "shimmer motion-reduce:animate-none")}
      {...props}
    />
  );
}

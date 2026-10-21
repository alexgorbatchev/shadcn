import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
export type GenerationLoaderVariant = "dots" | "squares" | "rounded";
export interface IGenerationLoaderProps extends Omit<ComponentProps<"div">, "children"> {
  label: string;
  tick: number;
  variant?: GenerationLoaderVariant;
}
const CELL_SHAPES: Record<GenerationLoaderVariant, string> = {
  dots: "rounded-full",
  squares: "rounded-[1px]",
  rounded: "rounded-[3px]",
};
export function GenerationLoader({
  label,
  tick,
  variant = "dots",
  className,
  ...props
}: IGenerationLoaderProps): JSX.Element {
  const pixelOffset = Math.floor(tick / 3);
  return (
    <div
      data-testid="GenerationLoader"
      role="status"
      data-slot="generation-loader"
      className={cn(cn("flex flex-col items-center gap-4"), className)}
      {...props}
    >
      <div aria-hidden className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }, (_, index) => {
          const active = (index * 2 + pixelOffset) % 9 < 3;
          return (
            <span
              data-testid={`GenerationLoader--cell-${index}`}
              key={index}
              className={cn(
                "bg-foreground size-2 transition-opacity duration-300 motion-reduce:transition-none",
                CELL_SHAPES[variant],
                active ? "opacity-90" : "opacity-15",
              )}
            />
          );
        })}
      </div>
      <ShimmerLabel>{label}</ShimmerLabel>
    </div>
  );
}

import type { ComponentProps } from "react";
import type { JSX } from "react";
import { cn } from "../../../utils/cn.js";
type ReasoningFadeProps = ComponentProps<"div"> & {
  side?: "top" | "bottom";
};
export function ReasoningFade({ side = "bottom", className, ...props }: ReasoningFadeProps): JSX.Element {
  if (side === "top") {
    return (
      <div
        data-testid="ReasoningFade"
        data-slot="reasoning-fade"
        className={cn(
          cn(
            "aui-reasoning-fade pointer-events-none absolute inset-x-0 top-0 z-10 h-8",
            "bg-[linear-gradient(to_bottom,var(--color-background),transparent)]",
            "group-data-[variant=muted]/reasoning-root:bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--color-muted)_50%,var(--color-background)),transparent)]",
            "fade-in-0 animate-in",
            "animation-duration-(--animation-duration)",
          ),
          className,
        )}
        {...props}
      />
    );
  }
  return (
    <div
      data-testid="ReasoningFade"
      data-slot="reasoning-fade"
      className={cn(
        cn(
          "aui-reasoning-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8",
          "bg-[linear-gradient(to_top,var(--color-background),transparent)]",
          "group-data-[variant=muted]/reasoning-root:bg-[linear-gradient(to_top,color-mix(in_oklab,var(--color-muted)_50%,var(--color-background)),transparent)]",
          "fade-in-0 animate-in",
          "animation-duration-(--animation-duration)",
        ),
        className,
      )}
      {...props}
    />
  );
}

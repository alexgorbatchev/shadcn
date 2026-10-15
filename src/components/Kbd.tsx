import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn";

type KbdProps = ComponentProps<"kbd"> & IDensityProps;

function Kbd({ density, className, ...props }: KbdProps): ReactElement {
  return (
    <kbd
      data-density={density}
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-tag w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-muted in-data-[slot=tooltip-content]:text-foreground  [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

type KbdGroupProps = ComponentProps<"kbd"> & IDensityProps;

function KbdGroup({ density, className, ...props }: KbdGroupProps): ReactElement {
  return (
    <kbd
      data-density={density}
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };

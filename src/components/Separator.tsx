import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cn } from "../utils/cn";

type SeparatorProps = SeparatorPrimitive.Props & IDensityProps;

function Separator({ density, className, orientation = "horizontal", ...props }: SeparatorProps): ReactElement | null {
  return (
    <SeparatorPrimitive
      data-density={density}
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };

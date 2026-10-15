import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cn } from "../utils/cn";

type SeparatorProps = SeparatorPrimitive.Props & IDensityProps;

function Separator({ density, className, orientation = "horizontal", ...props }: SeparatorProps): ReactElement {
  return (
    <SeparatorPrimitive
      data-density={density}
      data-slot="separator"
      orientation={orientation}
      className={(state) =>
        cn(
          "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { Separator };

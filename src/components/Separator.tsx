import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cn } from "../utils/cn.js";

type SeparatorProps = SeparatorPrimitive.Props & IDensityProps & { thickness?: "default" | "strong" };

function Separator({
  density,
  className,
  thickness = "default",
  orientation = "horizontal",
  ...props
}: SeparatorProps): ReactElement {
  return (
    <SeparatorPrimitive
      data-density={density}
      data-slot="separator"
      orientation={orientation}
      className={(state) =>
        cn(
          "shrink-0 bg-border data-[orientation=horizontal]:w-full data-[orientation=vertical]:self-stretch",
          thickness === "strong"
            ? "data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5"
            : "data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { Separator };

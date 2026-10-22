import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { DensityContext } from "../density/DensityContext.js";
import type { Density } from "../density/types.js";
import { cn } from "../utils/cn.js";

type DensityProviderState = { slot: "density-provider"; density: Density };

export interface IDensityProviderProps extends useRender.ComponentProps<"div", DensityProviderState> {
  density?: Density;
}

export function DensityProvider({
  density = "comfortable",
  className,
  render,
  ...props
}: IDensityProviderProps): ReactElement {
  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">({ className: cn("font-sans text-base leading-(--ag-leading)", className) }, props),
    render,
    state: { slot: "density-provider", density },
  });
  return <DensityContext.Provider value={density}>{element}</DensityContext.Provider>;
}

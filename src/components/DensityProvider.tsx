import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { DensityContext } from "../density/DensityContext.js";
import type { Density } from "../density/types.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import { cn } from "../utils/cn.js";

type DensityProviderState = { slot: "density-provider"; density: Density };

export interface IDensityProviderProps extends useRender.ComponentProps<"div", DensityProviderState> {
  density?: Density;
  touchOnMobile?: boolean;
}

const TOUCH_QUERY = "(width < 48rem), (pointer: coarse)";

export function DensityProvider({
  density = "comfortable",
  touchOnMobile = false,
  className,
  render,
  ...props
}: IDensityProviderProps): ReactElement {
  const matchesTouchQuery = useMediaQuery(TOUCH_QUERY);
  const resolvedDensity = touchOnMobile && matchesTouchQuery ? "touch" : density;
  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">({ className: cn("font-sans text-base leading-(--ag-leading)", className) }, props),
    render,
    state: { slot: "density-provider", density: resolvedDensity },
  });
  return <DensityContext.Provider value={resolvedDensity}>{element}</DensityContext.Provider>;
}

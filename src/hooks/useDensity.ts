import { useContext } from "react";
import { DensityContext } from "../density/DensityContext.js";
import type { Density } from "../density/types.js";

export function useDensity(density?: Density): Density {
  const inheritedDensity = useContext(DensityContext);
  return density ?? inheritedDensity;
}

import { useContext } from "react";
import { DensityContext } from "../density/DensityContext";
import type { Density } from "../density/types";

export function useDensity(density?: Density): Density {
  const inheritedDensity = useContext(DensityContext);
  return density ?? inheritedDensity;
}

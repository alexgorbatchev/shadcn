import { createContext } from "react";
import type { Density } from "./types";

export const DensityContext = createContext<Density>("comfortable");

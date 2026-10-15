import { createContext } from "react";
import type { Density } from "./types.js";

export const DensityContext = createContext<Density>("comfortable");

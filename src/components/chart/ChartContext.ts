import { createContext } from "react";
import type { IChartContextValue } from "./types.js";
export const ChartContext = createContext<IChartContextValue | null>(null);

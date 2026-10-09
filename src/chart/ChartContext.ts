import { createContext } from "react";
import type { IChartContextValue } from "./types";
export const ChartContext = createContext<IChartContextValue | null>(null);

import { useContext } from "react";
import { ChartContext } from "../ChartContext.js";
import type { IChartContextValue } from "../types.js";
export function useChart(): IChartContextValue {
  const context = useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

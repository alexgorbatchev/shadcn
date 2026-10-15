import { useContext } from "react";
import { ChartContext } from "../chart/ChartContext.js";
import type { IChartContextValue } from "../chart/types.js";
export function useChart(): IChartContextValue {
  const context = useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

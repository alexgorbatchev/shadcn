import { useContext } from "react";
import { AnalyticsContext } from "../analytics/AnalyticsContext.js";
import type { IAnalyticsProps } from "../analytics/types.js";

export function useAnalyticsEnabled(analytics?: IAnalyticsProps["analytics"]): boolean {
  return useContext(AnalyticsContext)?.enabled === true && analytics !== false;
}

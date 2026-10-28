import { useContext } from "react";
import { AnalyticsContext } from "../analytics/AnalyticsContext.js";
import type { IAnalyticsProps, UIAnalyticsDetail } from "../analytics/types.js";

type TrackAnalytics = (detail: UIAnalyticsDetail, source?: Event) => void;

export function useAnalytics(component: string, analytics?: IAnalyticsProps["analytics"]): TrackAnalytics {
  const context = useContext(AnalyticsContext);
  return (detail, source) => {
    if (!context || analytics === false) return;
    context.send(
      {
        ...detail,
        schemaVersion: 1,
        component,
        ...(analytics?.id === undefined ? {} : { id: analytics.id }),
        scope: context.scope,
        properties: { ...context.properties, ...analytics?.properties },
      },
      source,
    );
  };
}

import { useAnalyticsEnabled } from "./useAnalyticsEnabled.js";
import { useAnalytics } from "./useAnalytics.js";
import { analyticsSource, isAnalyticsCanceled, isAnalyticsProgrammatic } from "../analytics/analyticsSource.js";
import type { IAnalyticsProps, UIAnalyticsDetail } from "../analytics/types.js";

type AnalyticsCallback<Args extends unknown[]> = (...args: Args) => void;
type AnalyticsDetail<Args extends unknown[]> = UIAnalyticsDetail | ((...args: Args) => UIAnalyticsDetail);

export function useAnalyticsCallback<Args extends unknown[]>(
  component: string,
  analytics: IAnalyticsProps["analytics"],
  detail: AnalyticsDetail<NoInfer<Args>>,
  callback: AnalyticsCallback<Args> | undefined,
): AnalyticsCallback<Args> {
  const enabled = useAnalyticsEnabled(analytics);
  const track = useAnalytics(component, analytics);
  return (...args) => {
    callback?.(...args);
    if (!enabled) return;
    if (args.some(isAnalyticsCanceled) || args.some(isAnalyticsProgrammatic)) return;
    const event = typeof detail === "function" ? detail(...args) : detail;
    const source = args.map(analyticsSource).find((candidate) => candidate !== undefined);
    // Composed primitives may cancel later in the same dispatch. Read cancellation after all handlers run.
    queueMicrotask(() => {
      if (!args.some(isAnalyticsCanceled)) track(event, source);
    });
  };
}

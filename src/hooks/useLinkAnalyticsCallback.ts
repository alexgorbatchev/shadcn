import type { MouseEvent } from "react";
import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalytics } from "./useAnalytics.js";
import { useAnalyticsCallback } from "./useAnalyticsCallback.js";

type LinkClickHandler = (event: MouseEvent<HTMLAnchorElement>) => void;

/**
 * Tracks link activation. Client routers call the link's click handler and then prevent the default action to
 * navigate without a document load, so a link rendered through `render` reads cancellation when this handler runs
 * instead of after the dispatch. Handlers on the rendered element run first and can still cancel.
 */
export function useLinkAnalyticsCallback(
  component: string,
  analytics: IAnalyticsProps["analytics"],
  callback: LinkClickHandler | undefined,
  isRendered: boolean,
): LinkClickHandler {
  const deferred = useAnalyticsCallback(component, analytics, { name: "ui.activate" }, callback);
  const track = useAnalytics(component, analytics);
  if (!isRendered) return deferred;
  return (event) => {
    callback?.(event);
    if (!event.defaultPrevented) track({ name: "ui.activate" }, event.nativeEvent);
  };
}

"use client";

import { useContext, useLayoutEffect, useRef, type ReactElement } from "react";
import { AnalyticsContext } from "../../analytics/AnalyticsContext.js";
import type { IAnalyticsScopeProps, UIAnalyticsEvent } from "../../analytics/types.js";

export function AnalyticsScope({ children, name, properties, enabled = true }: IAnalyticsScopeProps): ReactElement {
  const parent = useContext(AnalyticsContext);
  const current = useRef(enabled);
  useLayoutEffect(() => {
    current.current = enabled;
    return () => {
      current.current = false;
    };
  }, [enabled]);
  function send(event: UIAnalyticsEvent, source?: Event): void {
    if (current.current) parent?.send(event, source);
  }
  return (
    <AnalyticsContext
      value={{
        enabled: enabled && parent?.enabled === true,
        scope: [...(parent?.scope ?? []), name],
        properties: { ...parent?.properties, ...properties },
        send,
      }}
    >
      {children}
    </AnalyticsContext>
  );
}

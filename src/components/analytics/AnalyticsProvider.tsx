"use client";

import { useContext, useLayoutEffect, useRef, type ReactElement } from "react";
import { AnalyticsContext } from "../../analytics/AnalyticsContext.js";
import type { IAnalyticsProviderProps, UIAnalyticsEvent } from "../../analytics/types.js";

export function AnalyticsProvider({ children, ...configuration }: IAnalyticsProviderProps): ReactElement {
  const parent = useContext(AnalyticsContext);
  const enabled = configuration.enabled !== false && parent?.enabled !== false;
  const current = useRef({ ...configuration, enabled });
  const active = useRef(false);
  const seen = useRef(new WeakMap<Event, Set<UIAnalyticsEvent["name"]>>());
  useLayoutEffect(() => {
    current.current = { ...configuration, enabled };
    active.current = true;
    return () => {
      active.current = false;
    };
  });

  function report(error: unknown): void {
    // Diagnostic callbacks must not turn an analytics failure into a UI failure either.
    try {
      current.current.onError?.(error);
    } catch {
      /* The host owns diagnostics. */
    }
  }

  function send(event: UIAnalyticsEvent, source?: Event): void {
    const { enabled = true, transport, filter } = current.current;
    if (!active.current || !enabled) return;
    try {
      if (filter && !filter(event)) return;
      if (source) {
        const names = seen.current.get(source) ?? new Set<UIAnalyticsEvent["name"]>();
        if (names.has(event.name)) return;
        names.add(event.name);
        seen.current.set(source, names);
      }
      const result = transport.track(event);
      if (result) void result.catch(report);
    } catch (error) {
      report(error);
    }
  }

  return <AnalyticsContext value={{ enabled, scope: [], properties: {}, send }}>{children}</AnalyticsContext>;
}

"use client";

import { useContext, useEffect, useEffectEvent, useRef, useState, type ReactElement } from "react";
import { useRender } from "@base-ui/react/use-render";
import { AnalyticsContext } from "../../analytics/AnalyticsContext.js";
import { useAnalytics } from "../../hooks/useAnalytics.js";
import type { IAnalyticsProps } from "../../analytics/types.js";

export interface IAnalyticsImpressionProps extends useRender.ComponentProps<"div">, IAnalyticsProps {
  component: string;
  threshold?: number;
  durationMs?: number;
  repeat?: boolean;
}

/** Measures continuous viewport intersection while the document is visible, not visual occlusion. */
export function AnalyticsImpression({
  analytics,
  component,
  threshold = 0.5,
  durationMs = 1000,
  repeat = false,
  render,
  ref,
  ...props
}: IAnalyticsImpressionProps): ReactElement {
  const context = useContext(AnalyticsContext);
  const enabled = context?.enabled === true && analytics !== false;
  const [element, setElement] = useState<HTMLElement | null>(null);
  const hasReported = useRef(false);
  const track = useAnalytics(component, analytics);
  const report = useEffectEvent(() => track({ name: "ui.impression" }));
  useEffect(() => {
    if (!element || !enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let isIntersecting = false;
    let reportedThisVisit = false;
    function clear(): void {
      clearTimeout(timer);
      timer = undefined;
    }
    function update(): void {
      clear();
      if (!isIntersecting || document.visibilityState !== "visible") {
        reportedThisVisit = false;
        return;
      }
      if (reportedThisVisit || (hasReported.current && !repeat)) return;
      timer = setTimeout(() => {
        hasReported.current = true;
        reportedThisVisit = true;
        report();
      }, durationMs);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        isIntersecting = Boolean(entry?.isIntersecting && entry.intersectionRatio >= threshold);
        update();
      },
      { threshold },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      clear();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [element, enabled, threshold, durationMs, repeat]);
  return useRender({ defaultTagName: "div", render, ref: [ref ?? null, setElement], props });
}

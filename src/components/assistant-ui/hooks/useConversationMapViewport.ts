import { useCallback, useEffect, useRef, useState } from "react";
import { useThreadViewport } from "@assistant-ui/react";
import type { ConversationProjection } from "../conversationMap/types.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";
type ViewportProjection = Pick<ConversationProjection, "turnOf" | "turnKey">;
interface IConversationMapViewport {
  viewportHeight: number;
  activeId: string | undefined;
  visibleIds: readonly string[];
  select: (id: string) => void;
}
const TOP_TOLERANCE = 1;
const sameIds = (a: readonly string[], b: readonly string[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
/**
 * The line a message has to cross to count as the one being read. It sits at
 * the top of the viewport for most of a thread, then slides to the bottom
 * across the final screenful: a message that starts within one viewport height
 * of the end can never reach the top, so a fixed line leaves the last screen's
 * worth of ticks permanently unreachable.
 */
const readingLine = (viewport: HTMLElement) => {
  const rect = viewport.getBoundingClientRect();
  const height = viewport.clientHeight;
  if (height <= 0) return rect.top + TOP_TOLERANCE;
  const remaining = viewport.scrollHeight - height - viewport.scrollTop;
  const descent = Math.min(1, Math.max(0, (height - remaining) / height));
  return rect.top + rect.height * descent + TOP_TOLERANCE;
};

export function useConversationMapViewport({ turnOf, turnKey }: ViewportProjection): IConversationMapViewport {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewport = useThreadViewport((s) => s.element.viewport);
  const viewportHeight = useThreadViewport((s) => s.height.viewport);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [visibleIds, setVisibleIds] = useState<readonly string[]>([]);
  const scheduleRef = useRef<VoidFunction | undefined>(undefined);
  const turnOfRef = useRef(turnOf);
  useEffect(() => {
    turnOfRef.current = turnOf;
  });
  useEffect(() => {
    if (!viewport) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const owners = turnOfRef.current;
      const view = viewport.getBoundingClientRect();
      const line = readingLine(viewport);
      // One pass yields both facts the rail draws: which turn is being read,
      // and which turns the viewport currently holds.
      let current: string | undefined;
      const onScreen: string[] = [];
      for (const element of viewport.querySelectorAll<HTMLElement>("[data-message-id]")) {
        const box = element.getBoundingClientRect();
        if (box.top >= view.bottom) break;
        const id = element.dataset["messageId"];
        const head = id === undefined ? undefined : owners.get(id);
        if (head === undefined) continue;
        if (box.top <= line) current = head;
        if (box.bottom > view.top && !onScreen.includes(head)) {
          onScreen.push(head);
        }
      }
      setActiveId(current ?? owners.values().next().value);
      setVisibleIds((previous) => (sameIds(previous, onScreen) ? previous : onScreen));
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    scheduleRef.current = schedule;
    schedule();
    viewport.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    return () => {
      scheduleRef.current = undefined;
      if (frame) cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, [viewport]);
  useEffect(() => {
    scheduleRef.current?.();
  }, [turnKey]);
  const select = useCallback(
    (id: string) => {
      if (!viewport) return;
      for (const element of viewport.querySelectorAll<HTMLElement>("[data-message-id]")) {
        if (element.dataset["messageId"] !== id) continue;
        // `scrollIntoView` aligns every scrollable ancestor, which drags the
        // page a thread is embedded in; only this viewport should move.
        const top = element.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
        viewport.scrollTo({ top, behavior: prefersReducedMotion ? "instant" : "smooth" });
        return;
      }
    },
    [viewport, prefersReducedMotion],
  );

  return { viewportHeight, activeId, visibleIds, select };
}

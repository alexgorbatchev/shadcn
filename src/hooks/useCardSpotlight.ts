import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

const SPOTLIGHT_X = "--card-spotlight-x";
const SPOTLIGHT_Y = "--card-spotlight-y";

interface IPointerCoordinates {
  clientX: number;
  clientY: number;
}

interface ICardSpotlightHandlers {
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
}

// Browsers fire no pointer events when content moves under a stationary pointer, so scrolling, viewport resizes,
// and card resizes are observed while the pointer is over the card. Capturing on window sees every scroll container.
function observeLayoutChanges(element: HTMLElement, onChange: () => void): () => void {
  const resizeObserver = new ResizeObserver(onChange);
  resizeObserver.observe(element);
  window.addEventListener("scroll", onChange, { capture: true, passive: true });
  window.addEventListener("resize", onChange, { passive: true });
  return () => {
    resizeObserver.disconnect();
    window.removeEventListener("scroll", onChange, { capture: true });
    window.removeEventListener("resize", onChange);
  };
}

// Writes the pointer position relative to the card into CSS variables consumed by the `card-spotlight` utility.
// Updates go straight to the element style, coalesced to one per animation frame, so moving the pointer does not
// re-render the card subtree or force a layout read for every pointer event.
export function useCardSpotlight(): ICardSpotlightHandlers {
  const frameRef = useRef(0);
  const pointerRef = useRef<IPointerCoordinates>({ clientX: 0, clientY: 0 });
  const stopObservingRef = useRef<(() => void) | null>(null);

  const scheduleUpdate = useCallback((element: HTMLElement) => {
    if (frameRef.current !== 0) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const { clientX, clientY } = pointerRef.current;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty(SPOTLIGHT_X, `${Math.round(clientX - bounds.left)}px`);
      element.style.setProperty(SPOTLIGHT_Y, `${Math.round(clientY - bounds.top)}px`);
    });
  }, []);

  const stopTracking = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    stopObservingRef.current?.();
    stopObservingRef.current = null;
  }, []);

  useEffect(() => stopTracking, [stopTracking]);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      pointerRef.current = { clientX: event.clientX, clientY: event.clientY };
      const element = event.currentTarget;
      stopObservingRef.current ??= observeLayoutChanges(element, () => scheduleUpdate(element));
      scheduleUpdate(element);
    },
    [scheduleUpdate],
  );

  const onPointerLeave = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      stopTracking();
      event.currentTarget.style.removeProperty(SPOTLIGHT_X);
      event.currentTarget.style.removeProperty(SPOTLIGHT_Y);
    },
    [stopTracking],
  );

  return { onPointerMove, onPointerLeave };
}

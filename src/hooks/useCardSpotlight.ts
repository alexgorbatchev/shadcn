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

// Writes the pointer position relative to the card into CSS variables consumed by the `card-spotlight` utility.
// Updates go straight to the element style, coalesced to one per animation frame, so moving the pointer does not
// re-render the card subtree or force a layout read for every pointer event.
export function useCardSpotlight(): ICardSpotlightHandlers {
  const frameRef = useRef(0);
  const pointerRef = useRef<IPointerCoordinates>({ clientX: 0, clientY: 0 });

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    pointerRef.current = { clientX: event.clientX, clientY: event.clientY };
    if (frameRef.current !== 0) {
      return;
    }
    const element = event.currentTarget;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const { clientX, clientY } = pointerRef.current;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty(SPOTLIGHT_X, `${Math.round(clientX - bounds.left)}px`);
      element.style.setProperty(SPOTLIGHT_Y, `${Math.round(clientY - bounds.top)}px`);
    });
  }, []);

  const onPointerLeave = useCallback((event: PointerEvent<HTMLElement>) => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    event.currentTarget.style.removeProperty(SPOTLIGHT_X);
    event.currentTarget.style.removeProperty(SPOTLIGHT_Y);
  }, []);

  return { onPointerMove, onPointerLeave };
}

import { useLayoutEffect, useRef, type ReactElement } from "react";
import type { NumberRollRenderedPart } from "../utils/numberRollTypes.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { NumberRollDigit } from "./NumberRollDigit.js";
import { cn } from "../../../utils/cn.js";

interface INumberRollPartProps {
  part: NumberRollRenderedPart;
  direction: number;
  duration: number;
}

export function NumberRollPart({ part, direction, duration }: INumberRollPartProps): ReactElement {
  const reference = useRef<HTMLSpanElement>(null);
  const isReducedMotion = usePrefersReducedMotion();
  useLayoutEffect(() => {
    if (!reference.current || isReducedMotion || duration <= 0 || (!part.hasEntered && !part.isExiting)) return;
    const frames: Keyframe[] = [
      { gridTemplateColumns: "0fr", opacity: 0, translate: `0 ${direction * (part.isExiting ? -35 : 35)}%` },
      { gridTemplateColumns: "1fr", opacity: 1, translate: "0 0%" },
    ];
    const animation = reference.current.animate(part.isExiting ? frames.reverse() : frames, {
      duration: duration * 0.6,
      easing: "ease-out",
    });
    return () => animation.cancel();
  }, [part.hasEntered, part.isExiting, direction, duration, isReducedMotion]);
  return (
    <span
      ref={reference}
      data-testid="NumberRollPart"
      className={cn(
        "inline-grid",
        part.isExiting ? "pointer-events-none grid-cols-[0fr] opacity-0" : "grid-cols-[1fr]",
      )}
    >
      <span className="min-w-0 overflow-hidden">
        {part.type === "digit" ? (
          <NumberRollDigit digit={part.digit} direction={direction} duration={duration} />
        ) : (
          <span className="whitespace-pre">{part.value}</span>
        )}
      </span>
    </span>
  );
}

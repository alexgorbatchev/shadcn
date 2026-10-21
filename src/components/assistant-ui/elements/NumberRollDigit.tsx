import { useLayoutEffect, useRef, type ReactElement } from "react";
import { getNumberRollCellOffset, getRollDelta } from "../utils/getNumberRollParts.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

interface INumberRollDigitProps {
  digit: number;
  direction: number;
  duration: number;
}
const CELLS = Array.from({ length: 10 }, (_, index) => index);

export function NumberRollDigit({ digit, direction, duration }: INumberRollDigitProps): ReactElement {
  const reference = useRef<HTMLSpanElement>(null);
  const previousDigit = useRef(digit);
  const isReducedMotion = usePrefersReducedMotion();
  useLayoutEffect(() => {
    const from = previousDigit.current;
    previousDigit.current = digit;
    const delta = getRollDelta(from, digit, direction);
    if (!reference.current || isReducedMotion || delta === 0 || duration <= 0) return;
    const steps = Math.abs(delta) * 4;
    const animations = Array.from(reference.current.querySelectorAll<HTMLElement>("[data-digit-cell]"), (cell) => {
      const index = Number(cell.dataset.digitCell);
      const frames = Array.from({ length: steps + 1 }, (_, step) => ({
        offset: step / steps,
        transform: `translateY(${getNumberRollCellOffset(index, from + (delta * step) / steps) * 100}%)`,
      }));
      return cell.animate(frames, { duration, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    });
    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [digit, direction, duration, isReducedMotion]);
  return (
    <span ref={reference} data-testid="NumberRollDigit" className="relative inline-block overflow-clip">
      <span data-digit={digit} className="invisible before:content-[attr(data-digit)]" />
      {CELLS.map((cell) => (
        <span
          key={cell}
          data-digit-cell={cell}
          data-digit={cell}
          className="absolute inset-0 text-center before:content-[attr(data-digit)]"
          style={{ transform: `translateY(${getNumberRollCellOffset(cell, digit) * 100}%)` }}
        />
      ))}
    </span>
  );
}

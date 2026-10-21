import { useLayoutEffect, useMemo, useRef, type ComponentProps, type ReactElement } from "react";
import { getDotMatrixPattern, type DotMatrixState, type IDotMatrixDot } from "../utils/getDotMatrixPattern.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { cn } from "../../../utils/cn.js";

type DotMatrixProps = Omit<ComponentProps<"span">, "children" | "className" | "style"> & {
  state?: DotMatrixState;
  label?: string;
};
interface IDotMatrixDotProps {
  dot: IDotMatrixDot;
  isReducedMotion: boolean;
}

function DotMatrixDot({ dot, isReducedMotion }: IDotMatrixDotProps): ReactElement {
  const reference = useRef<SVGCircleElement>(null);
  useLayoutEffect(() => {
    if (!reference.current || !dot.blink || isReducedMotion) return;
    const animation = reference.current.animate(
      [{ opacity: dot.opacity }, { opacity: dot.blink.lo }, { opacity: dot.opacity }],
      {
        duration: dot.blink.duration * 1000,
        delay: dot.blink.delay * 1000,
        iterations: Infinity,
        easing: "ease-in-out",
      },
    );
    return () => animation.cancel();
  }, [dot, isReducedMotion]);
  return <circle ref={reference} cx={dot.x} cy={dot.y} r={1.3} opacity={dot.opacity} />;
}

/** Status patterns use native animations owned by each SVG, including inside injected ShadowRoots. */
export function DotMatrix({ state = "loading", label, ...props }: DotMatrixProps): ReactElement {
  const pattern = useMemo(() => getDotMatrixPattern(state), [state]);
  const isReducedMotion = usePrefersReducedMotion();
  return (
    <span
      data-testid="DotMatrix"
      data-state={state}
      role="status"
      className={cn("inline-block size-4 shrink-0", pattern.color)}
      {...props}
    >
      <span className="sr-only">{label ?? state}</span>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-full">
        {pattern.dots.map((dot) => (
          <DotMatrixDot key={dot.index} dot={dot} isReducedMotion={isReducedMotion} />
        ))}
      </svg>
    </span>
  );
}

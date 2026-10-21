import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../../../utils/cn.js";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect.js";
import { labelSwap, labelSwapIn, labelSwapOut } from "./constants.js";
interface ISwapLabelProps {
  active: 0 | 1;
  children: [ReactNode, ReactNode];
}
export function SwapLabel({ active, children }: ISwapLabelProps): ReactElement {
  const firstLayer = useRef<HTMLSpanElement>(null);
  const secondLayer = useRef<HTMLSpanElement>(null);
  const layers = [firstLayer, secondLayer];
  const [width, setWidth] = useState<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const target = active === 0 ? firstLayer.current : secondLayer.current;
    if (!target) return undefined;
    const measure = (): void => setWidth(Math.ceil(target.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    return () => observer.disconnect();
  }, [active]);
  return (
    <span
      data-testid="SwapLabel"
      style={width === null ? undefined : { width }}
      className="grid overflow-x-clip text-start transition-[width] duration-300 motion-reduce:transition-none"
    >
      {children.map((layer, index) => (
        <span
          key={index}
          ref={layers[index]}
          aria-hidden={active !== index}
          className={cn(labelSwap, active === index ? labelSwapIn : labelSwapOut)}
        >
          {layer}
        </span>
      ))}
    </span>
  );
}

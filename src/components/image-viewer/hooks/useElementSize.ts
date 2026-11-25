import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useState, type RefObject } from "react";
import type { IImageSize } from "../types.js";

/** Tracks an element's client size, which excludes borders and scrollbars. */
export function useElementSize(target: RefObject<HTMLElement | null> | HTMLElement | null): IImageSize | undefined {
  const [size, setSize] = useState<IImageSize>();
  useIsoLayoutEffect(() => {
    const element = target && "current" in target ? target.current : target;
    if (!element) return undefined;
    const measure = (): void => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      setSize((current) => (current?.width === width && current.height === height ? current : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);
  return target ? size : undefined;
}

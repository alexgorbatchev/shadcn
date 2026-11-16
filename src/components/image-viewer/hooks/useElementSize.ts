import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useState, type RefObject } from "react";
import type { IImageSize } from "../types.js";

/** Tracks an element's client size, which excludes borders and scrollbars. */
export function useElementSize(ref: RefObject<HTMLElement | null>): IImageSize | undefined {
  const [size, setSize] = useState<IImageSize>();
  useIsoLayoutEffect(() => {
    const element = ref.current;
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
  }, [ref]);
  return size;
}

import { type RefObject, useLayoutEffect, useState } from "react";

interface IComposerMenuFit {
  shift: number;
  maxWidth: number;
}
type ComposerMenuAlignment = "start" | "end";
type ComposerMenuFit = IComposerMenuFit | null;

export function useFitInComposer(
  menuRef: RefObject<HTMLDivElement | null>,
  align: ComposerMenuAlignment,
): ComposerMenuFit {
  const [fit, setFit] = useState<ComposerMenuFit>(null);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return undefined;
    const bounds = menu.closest<HTMLElement>('[data-slot="composer"]') ?? document.documentElement;
    const measure = () => {
      const parent = menu.offsetParent;
      if (!parent) return;
      const { left: min, right: max } = bounds.getBoundingClientRect();
      const left = parent.getBoundingClientRect().left + menu.offsetLeft;
      const width = Math.min(menu.offsetWidth, max - min);
      const shift = Math.max(min - left, Math.min(0, max - left - width));
      setFit((current) =>
        current?.shift === shift && current.maxWidth === max - min ? current : { shift, maxWidth: max - min },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bounds);
    observer.observe(menu);
    return () => observer.disconnect();
  }, [menuRef, align]);

  return fit;
}

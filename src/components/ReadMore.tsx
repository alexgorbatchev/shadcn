"use client";
import { useId, useLayoutEffect, useRef, useState, type ComponentProps, type ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";
import { Button } from "./Button.js";

type ReadMoreProps = ComponentProps<"div"> &
  IDensityProps & {
    /** The height the content folds to, as a CSS length such as `12rem`. Shorter content shows in full. */
    maxHeight: string;
  };

/**
 * Long content folded to `maxHeight`, with a More button that shows the rest for good: once unfolded, the content stays
 * open, the button goes away and focus moves to the content. Content that fits shows in full with no button. The fold
 * fades out its last line so the cut reads as intended.
 */
function ReadMore({ maxHeight, density, className, style, children, ...props }: ReadMoreProps): ReactElement {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // The pressed More unmounts, so focus moves to the content it unfolded instead of falling to the document body.
  const shouldFocusContent = useRef(false);
  useLayoutEffect(() => {
    if (!isOpen || !shouldFocusContent.current) return;
    shouldFocusContent.current = false;
    ref.current?.focus();
  }, [isOpen]);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || isOpen) return;
    const measure = () => setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isOpen, maxHeight]);
  const isFolded = !isOpen;
  return (
    <div data-density={density} data-slot="read-more" className="flex min-w-0 flex-col items-start gap-1">
      <div
        id={`${id}-content`}
        ref={ref}
        data-slot="read-more-content"
        data-folded={(isFolded && isOverflowing) || undefined}
        tabIndex={isOpen ? -1 : undefined}
        className={cn(
          "w-full min-w-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid data-folded:mask-b-from-[calc(100%-2rem)] data-folded:mask-b-to-100%",
          isFolded && "overflow-hidden",
          className,
        )}
        style={isFolded ? { ...style, maxHeight } : style}
        {...props}
      >
        {children}
      </div>
      {isOverflowing && isFolded && (
        <Button
          type="button"
          variant="outline"
          size="xs"
          data-slot="read-more-toggle"
          aria-expanded={false}
          aria-controls={`${id}-content`}
          onClick={() => {
            shouldFocusContent.current = true;
            setIsOpen(true);
          }}
        >
          More
        </Button>
      )}
    </div>
  );
}

export { ReadMore };
export type { ReadMoreProps };

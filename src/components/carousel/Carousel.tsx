import type { ComponentProps, KeyboardEvent, ReactElement } from "react";
import type { CarouselProps } from "./types.js";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useDirection } from "@base-ui/react/direction-provider";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "lucide-react";
import { CarouselContext } from "./CarouselContext.js";
import { useCarousel } from "./hooks/useCarousel.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../Button.js";

function Carousel({
  density,
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  onKeyDown,
  ...props
}: CarouselProps): ReactElement {
  const inheritedDirection = useDirection();
  const direction = opts?.direction ?? inheritedDirection;
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      direction,
      axis: orientation === "horizontal" ? "x" : "y",
      breakpoints: {
        ...opts?.breakpoints,
        "(prefers-reduced-motion: reduce)": {
          ...opts?.breakpoints?.["(prefers-reduced-motion: reduce)"],
          duration: 0,
        },
      },
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);
  useEffect(() => {
    if (!api) return;
    const update = (): void => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update();
    api.on("reInit", update);
    api.on("select", update);
    return () => {
      api.off("reInit", update);
      api.off("select", update);
    };
  }, [api]);
  useEffect(() => {
    if (api) setApi?.(api);
  }, [api, setApi]);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    const previousKey = orientation === "vertical" ? "ArrowUp" : direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (event.key === previousKey) {
      event.preventDefault();
      scrollPrev();
    }
    if (event.key === nextKey) {
      event.preventDefault();
      scrollNext();
    }
  };
  return (
    <CarouselContext.Provider
      value={{ carouselRef, api, orientation, direction, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div
        data-slot="carousel"
        data-density={density}
        dir={direction}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        className={cn("relative outline-none focus-visible:ring-1 focus-visible:ring-ring", className)}
        {...props}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: ComponentProps<"div">): ReactElement {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} data-slot="carousel-content" className="overflow-hidden">
      <div
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "-ms-panel touch-pan-y touch-pinch-zoom"
            : "-mt-panel flex-col touch-pan-x touch-pinch-zoom",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: ComponentProps<"div">): ReactElement {
  const { orientation } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-h-0 min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "ps-panel" : "pt-panel",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  disabled,
  onClick,
  children,
  ...props
}: ComponentProps<typeof Button>): ReactElement {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={(state) =>
        cn(
          "absolute touch-manipulation",
          orientation === "horizontal" ? "inset-y-0 -start-10 my-auto" : "-top-10 left-1/2 -translate-x-1/2",
          typeof className === "function" ? className(state) : className,
        )
      }
      disabled={disabled || !canScrollPrev}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollPrev();
      }}
      {...props}
    >
      {children ?? (
        <>
          {orientation === "horizontal" ? <ChevronLeftIcon className="rtl:rotate-180" /> : <ChevronUpIcon />}
          <span className="sr-only">Previous slide</span>
        </>
      )}
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  disabled,
  onClick,
  children,
  ...props
}: ComponentProps<typeof Button>): ReactElement {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={(state) =>
        cn(
          "absolute touch-manipulation",
          orientation === "horizontal" ? "inset-y-0 -end-10 my-auto" : "-bottom-10 left-1/2 -translate-x-1/2",
          typeof className === "function" ? className(state) : className,
        )
      }
      disabled={disabled || !canScrollNext}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollNext();
      }}
      {...props}
    >
      {children ?? (
        <>
          {orientation === "horizontal" ? <ChevronRightIcon className="rtl:rotate-180" /> : <ChevronDownIcon />}
          <span className="sr-only">Next slide</span>
        </>
      )}
    </Button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };

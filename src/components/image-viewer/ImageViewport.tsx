import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useRef, type ReactElement, type ReactNode, type Ref, type RefObject, type UIEvent } from "react";
import { cn } from "../../utils/cn.js";
import { getImageStageSize } from "./getImageStageSize.js";
import { useElementSize } from "./hooks/useElementSize.js";
import type { IImageSize, INormalizedImagePoint, ImageZoom } from "./types.js";

interface IImageViewportProps {
  /** Accessible name of the scroll region. */
  label: string;
  zoom: ImageZoom;
  /** Natural size of the image box; the stage stays empty until it is known. */
  naturalSize: IImageSize | undefined;
  /** Viewed center shared with sibling viewports; restored after zoom changes and when a viewport mounts. */
  center: RefObject<INormalizedImagePoint>;
  /** Stage content, positioned over the rendered image box. */
  children: ReactNode;
  /** Replaces the stage, for example with a load failure message. */
  fallback?: ReactNode;
  viewportRef?: Ref<HTMLDivElement>;
  onViewportScroll?: (viewport: HTMLDivElement) => void;
}

/**
 * Native scroll viewport that centers an image box. Fit zoom never scrolls; original zoom scrolls on any axis where
 * the image is larger than the viewport. Auto margins center a smaller box without clipping a larger one's start edge.
 */
export function ImageViewport({
  label,
  zoom,
  naturalSize,
  center,
  children,
  fallback,
  viewportRef,
  onViewportScroll,
}: IImageViewportProps): ReactElement {
  const elementRef = useRef<HTMLDivElement>(null);
  const ref = useMergedRefs(elementRef, viewportRef);
  const viewportSize = useElementSize(elementRef);
  const stage = naturalSize && viewportSize ? getImageStageSize(naturalSize, viewportSize, zoom) : undefined;
  const stageWidth = stage?.width ?? 0;
  const stageHeight = stage?.height ?? 0;

  useIsoLayoutEffect(() => {
    const viewport = elementRef.current;
    if (!viewport || stageWidth === 0 || stageHeight === 0) return;
    if (zoom === "fit") {
      center.current = { x: 0.5, y: 0.5 };
      return;
    }
    viewport.scrollLeft = center.current.x * stageWidth - viewport.clientWidth / 2;
    viewport.scrollTop = center.current.y * stageHeight - viewport.clientHeight / 2;
  }, [center, stageHeight, stageWidth, zoom]);

  function handleScroll(event: UIEvent<HTMLDivElement>): void {
    const viewport = event.currentTarget;
    if (zoom === "original" && stageWidth > 0 && stageHeight > 0) {
      center.current = {
        x: stageWidth > viewport.clientWidth ? (viewport.scrollLeft + viewport.clientWidth / 2) / stageWidth : 0.5,
        y: stageHeight > viewport.clientHeight ? (viewport.scrollTop + viewport.clientHeight / 2) / stageHeight : 0.5,
      };
    }
    onViewportScroll?.(viewport);
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-slot="image-viewport"
      data-zoom={zoom}
      onScroll={handleScroll}
      className={cn(
        "flex min-h-0 min-w-0 flex-1 overscroll-contain outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
        zoom === "fit" ? "overflow-hidden" : "overflow-auto",
      )}
    >
      {fallback ?? (
        <div
          data-slot="image-stage"
          className="relative m-auto shrink-0"
          style={{ width: stageWidth, height: stageHeight }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

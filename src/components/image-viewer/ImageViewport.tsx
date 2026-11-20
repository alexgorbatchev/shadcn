import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useStableCallback } from "@base-ui/utils/useStableCallback";
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
  type UIEvent,
} from "react";
import { cn } from "../../utils/cn.js";
import { getImageStageSize } from "./getImageStageSize.js";
import { useElementSize } from "./hooks/useElementSize.js";
import {
  clampImageZoomScale,
  formatImageZoom,
  getImageZoomScales,
  getNextImageZoom,
  getPreviousImageZoom,
} from "./imageZoom.js";
import type { IImageSize, INormalizedImagePoint, ImageZoom } from "./types.js";

interface IImageViewportProps {
  /** Accessible name of the stage; the current zoom percent is appended, as in "Dashboard screenshot, 150%". */
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
  /** Enables zooming by stage keys, Mod+wheel and pinch. */
  onZoomChange?: (zoom: ImageZoom) => void;
  /**
   * Runs before the stage keys while the stage itself has focus; call `preventDefault()` to replace a stage key, such
   * as arrows that move a placed region instead of panning.
   */
  onStageKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Further `aria-keyshortcuts` the stage handles through `onStageKeyDown`, such as "R". */
  stageKeyShortcuts?: string;
}

type Gesture =
  | { kind: "pan"; pointerId: number; startX: number; startY: number; left: number; top: number; moved: boolean }
  | { kind: "pinch"; distance: number; scale: number };

/** Pointer travel, in CSS pixels, before a press becomes a pan rather than a click. */
const PAN_THRESHOLD = 4;
/** Share of the visible stage one arrow key press pans. */
const KEY_PAN_FRACTION = 0.1;
/** Smallest pan per arrow key press, in CSS pixels. */
const KEY_PAN_MINIMUM = 40;
const STAGE_KEYS = "+ = - 0 1 ArrowUp ArrowDown ArrowLeft ArrowRight";

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function getDistance(points: Pick<MouseEvent, "clientX" | "clientY">[]): number {
  const [first, second] = points;
  if (!first || !second) return 0;
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function getMidpoint(points: Pick<MouseEvent, "clientX" | "clientY">[]): Pick<MouseEvent, "clientX" | "clientY"> {
  const [first, second] = points;
  if (!first || !second) return first ?? { clientX: 0, clientY: 0 };
  return { clientX: (first.clientX + second.clientX) / 2, clientY: (first.clientY + second.clientY) / 2 };
}

/** Wheel distance in CSS pixels, whatever unit the device reports. */
function getWheelPixels(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * 400;
  return event.deltaY;
}

/**
 * Native scroll viewport that centers an image box. Fit zoom never scrolls; larger zooms scroll on any axis where the
 * image is larger than the viewport. Auto margins center a smaller box without clipping a larger one's start edge.
 *
 * The stage owns its gestures, so a touch never scrolls the page or zooms the browser: a drag with one pointer pans,
 * two fingers pinch-zoom, Mod+wheel (and a trackpad pinch) zooms around the pointer, and while the stage has focus
 * + or = zooms in, − zooms out, 0 fits, 1 shows 100% and arrows pan while the image is larger than the stage. Overlay
 * content that handles a pointer itself, such as a region tool, calls `preventDefault()` on its `pointerdown`, which
 * keeps that pointer from panning while a second finger still pinches.
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
  onZoomChange,
  onStageKeyDown,
  stageKeyShortcuts,
}: IImageViewportProps): ReactElement {
  const elementRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ref = useMergedRefs(elementRef, viewportRef);
  const viewportSize = useElementSize(elementRef);
  const pointers = useRef(new Map<number, Pick<MouseEvent, "clientX" | "clientY">>());
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const scales = naturalSize && viewportSize ? getImageZoomScales(naturalSize, viewportSize) : undefined;
  const stage = naturalSize && viewportSize ? getImageStageSize(naturalSize, viewportSize, zoom) : undefined;
  const stageWidth = stage?.width ?? 0;
  const stageHeight = stage?.height ?? 0;
  const canPanX = viewportSize !== undefined && stageWidth > viewportSize.width + 0.5;
  const canPanY = viewportSize !== undefined && stageHeight > viewportSize.height + 0.5;

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

  /** Changes the zoom so the image point under `anchor` (by default the viewport's center) stays where it is. */
  const changeZoom = useStableCallback((next: ImageZoom, anchor?: Pick<MouseEvent, "clientX" | "clientY">): void => {
    const viewport = elementRef.current;
    const stageElement = stageRef.current;
    if (!onZoomChange || !viewport || !stageElement || !naturalSize || !viewportSize) return;
    const nextStage = getImageStageSize(naturalSize, viewportSize, next);
    if (nextStage.width > 0 && nextStage.height > 0) {
      const frame = viewport.getBoundingClientRect();
      const box = stageElement.getBoundingClientRect();
      const middle = {
        clientX: frame.left + viewport.clientLeft + viewport.clientWidth / 2,
        clientY: frame.top + viewport.clientTop + viewport.clientHeight / 2,
      };
      const point = anchor ?? middle;
      const x = box.width > 0 ? (point.clientX - box.left) / box.width : 0.5;
      const y = box.height > 0 ? (point.clientY - box.top) / box.height : 0.5;
      center.current = {
        x: clampUnit(x - (point.clientX - middle.clientX) / nextStage.width),
        y: clampUnit(y - (point.clientY - middle.clientY) / nextStage.height),
      };
    }
    onZoomChange(next);
  });

  const handleWheel = useStableCallback((event: WheelEvent): void => {
    if (!(event.ctrlKey || event.metaKey) || !onZoomChange || !stage || !scales) return;
    event.preventDefault();
    const next = clampImageZoomScale(stage.scale * Math.exp(-getWheelPixels(event) * 0.01), scales);
    if (Math.abs(next - stage.scale) > 0.0005) changeZoom(next, event);
  });

  useEffect(() => {
    const viewport = elementRef.current;
    if (!viewport) return undefined;
    // React registers wheel listeners as passive, which cannot keep the browser from zooming the page.
    const listener = (event: WheelEvent): void => handleWheel(event);
    viewport.addEventListener("wheel", listener, { passive: false });
    return () => viewport.removeEventListener("wheel", listener);
  }, [handleWheel]);

  function handleScroll(event: UIEvent<HTMLDivElement>): void {
    const viewport = event.currentTarget;
    if (zoom !== "fit" && stageWidth > 0 && stageHeight > 0) {
      center.current = {
        x: stageWidth > viewport.clientWidth ? (viewport.scrollLeft + viewport.clientWidth / 2) / stageWidth : 0.5,
        y: stageHeight > viewport.clientHeight ? (viewport.scrollTop + viewport.clientHeight / 2) / stageHeight : 0.5,
      };
    }
    onViewportScroll?.(viewport);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) return;
    onStageKeyDown?.(event);
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || !stage || !scales) return;
    const viewport = event.currentTarget;
    const panX = Math.max(KEY_PAN_MINIMUM, viewport.clientWidth * KEY_PAN_FRACTION);
    const panY = Math.max(KEY_PAN_MINIMUM, viewport.clientHeight * KEY_PAN_FRACTION);
    switch (event.key) {
      case "+":
      case "=":
        if (!onZoomChange) return;
        changeZoom(getNextImageZoom(stage.scale));
        break;
      case "-":
      case "_":
        if (!onZoomChange) return;
        changeZoom(getPreviousImageZoom(stage.scale, scales));
        break;
      case "0":
        if (!onZoomChange) return;
        changeZoom("fit");
        break;
      case "1":
        if (!onZoomChange) return;
        changeZoom(1);
        break;
      case "ArrowLeft":
      case "ArrowRight":
        if (!canPanX) return;
        viewport.scrollBy({ left: event.key === "ArrowLeft" ? -panX : panX, behavior: "instant" });
        break;
      case "ArrowUp":
      case "ArrowDown":
        if (!canPanY) return;
        viewport.scrollBy({ top: event.key === "ArrowUp" ? -panY : panY, behavior: "instant" });
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    const points = [...pointers.current.values()];
    if (points.length === 2 && event.pointerType === "touch" && onZoomChange && stage) {
      gesture.current = { kind: "pinch", distance: getDistance(points), scale: stage.scale };
      return;
    }
    if (points.length !== 1 || event.defaultPrevented) return;
    const viewport = event.currentTarget;
    gesture.current = {
      kind: "pan",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
      moved: false,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    const current = gesture.current;
    if (!current) return;
    if (current.kind === "pinch") {
      const points = [...pointers.current.values()];
      const distance = getDistance(points);
      if (!scales || current.distance <= 0 || distance <= 0) return;
      const next = clampImageZoomScale((current.scale * distance) / current.distance, scales);
      changeZoom(next, getMidpoint(points));
      return;
    }
    if (current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    const viewport = event.currentTarget;
    if (!current.moved) {
      if (Math.abs(dx) < PAN_THRESHOLD && Math.abs(dy) < PAN_THRESHOLD) return;
      current.moved = true;
      suppressClick.current = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.panning = "";
    }
    viewport.scrollLeft = current.left - dx;
    viewport.scrollTop = current.top - dy;
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
    pointers.current.delete(event.pointerId);
    const current = gesture.current;
    if (current?.kind === "pinch" && pointers.current.size < 2) gesture.current = null;
    if (current?.kind === "pan" && current.pointerId === event.pointerId) gesture.current = null;
    delete event.currentTarget.dataset.panning;
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>): void {
    if (!suppressClick.current) return;
    // The click that ends a pan is not a click on whatever lies under the pointer.
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label={stage ? `${label}, ${formatImageZoom(stage.scale)}` : label}
      aria-keyshortcuts={onZoomChange ? [STAGE_KEYS, stageKeyShortcuts].filter(Boolean).join(" ") : stageKeyShortcuts}
      tabIndex={0}
      data-slot="image-viewport"
      data-zoom={zoom}
      data-scale={stage?.scale}
      data-pannable={canPanX || canPanY ? "" : undefined}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClickCapture={handleClickCapture}
      className={cn(
        "flex min-h-0 min-w-0 flex-1 touch-none overscroll-contain outline-none select-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset data-pannable:cursor-grab data-panning:cursor-grabbing",
        zoom === "fit" ? "overflow-hidden" : "overflow-auto",
      )}
    >
      {fallback ?? (
        <div
          ref={stageRef}
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

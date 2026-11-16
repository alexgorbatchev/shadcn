import { useControlled } from "@base-ui/utils/useControlled";
import { useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { Separator } from "../Separator.js";
import { ImageComparisonToolbar } from "./ImageComparisonToolbar.js";
import { ImageDifferenceOverlay } from "./ImageDifferenceOverlay.js";
import { ImageSwipeDivider } from "./ImageSwipeDivider.js";
import { ImageViewport } from "./ImageViewport.js";
import { useImageDifferences } from "./hooks/useImageDifferences.js";
import { useImageLoad } from "./hooks/useImageLoad.js";
import type {
  IImageComparisonSource,
  INormalizedImagePoint,
  ImageComparisonMode,
  ImageComparisonOrientation,
  ImageZoom,
} from "./types.js";

export interface IImageComparisonProps extends IDensityProps {
  before: IImageComparisonSource;
  after: IImageComparisonSource;
  /** Defaults to "Before". */
  beforeLabel?: string;
  /** Defaults to "After". */
  afterLabel?: string;
  /** Controlled presentation mode. */
  mode?: ImageComparisonMode;
  /** Initial mode when uncontrolled. Defaults to `toggle`. */
  defaultMode?: ImageComparisonMode;
  onModeChange?: (mode: ImageComparisonMode) => void;
  /** Controlled side-by-side arrangement. */
  orientation?: ImageComparisonOrientation;
  /** Initial side-by-side arrangement when uncontrolled. Defaults to `horizontal` (left and right). */
  defaultOrientation?: ImageComparisonOrientation;
  onOrientationChange?: (orientation: ImageComparisonOrientation) => void;
  /** Controlled zoom shared by every mode. */
  zoom?: ImageZoom;
  /** Initial zoom when uncontrolled. Defaults to `fit`. */
  defaultZoom?: ImageZoom;
  onZoomChange?: (zoom: ImageZoom) => void;
  /** Controlled difference highlighting. */
  showDifferences?: boolean;
  /** Initial difference highlighting when uncontrolled. Defaults to false. */
  defaultShowDifferences?: boolean;
  onShowDifferencesChange?: (showDifferences: boolean) => void;
  /** Shows the comparison controls. Defaults to true. */
  showToolbar?: boolean;
  /** Accessible name of the comparison. Defaults to "Image comparison". */
  label?: string;
}

interface IComparisonPaneProps {
  header: ReactNode;
  children: ReactNode;
}

function ComparisonPane({ header, children }: IComparisonPaneProps): ReactElement {
  return (
    <div data-slot="image-comparison-pane" data-scroll="none" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        data-slot="image-comparison-pane-header"
        className="flex h-control shrink-0 items-center justify-between gap-2 px-control-x text-xs font-medium text-muted-foreground"
      >
        {header}
      </div>
      {children}
    </div>
  );
}

interface IScrollPosition {
  left: number;
  top: number;
}

/**
 * Compares before and after images by toggling, swiping a divider, or showing them side by side. Every mode starts
 * fitted to the available space and offers original size with scrolling. A differently sized before image is drawn
 * inside the after image's box. Highlighting differences compares pixels on first use and caches the result per pair.
 */
export function ImageComparison({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  mode: modeProp,
  defaultMode = "toggle",
  onModeChange,
  orientation: orientationProp,
  defaultOrientation = "horizontal",
  onOrientationChange,
  zoom: zoomProp,
  defaultZoom = "fit",
  onZoomChange,
  showDifferences: showDifferencesProp,
  defaultShowDifferences = false,
  onShowDifferencesChange,
  showToolbar = true,
  label = "Image comparison",
  density,
}: IImageComparisonProps): ReactElement {
  const [mode, setModeState] = useControlled({
    controlled: modeProp,
    default: defaultMode,
    name: "ImageComparison",
    state: "mode",
  });
  const [orientation, setOrientationState] = useControlled({
    controlled: orientationProp,
    default: defaultOrientation,
    name: "ImageComparison",
    state: "orientation",
  });
  const [zoom, setZoomState] = useControlled({
    controlled: zoomProp,
    default: defaultZoom,
    name: "ImageComparison",
    state: "zoom",
  });
  const [showDifferences, setShowDifferencesState] = useControlled({
    controlled: showDifferencesProp,
    default: defaultShowDifferences,
    name: "ImageComparison",
    state: "showDifferences",
  });
  const [isPeeking, setIsPeeking] = useState(false);
  const [position, setPosition] = useState(50);
  const [beforeImage, beforeHandlers] = useImageLoad(before.src);
  const [afterImage, afterHandlers] = useImageLoad(after.src);
  const beforeRef = useRef<HTMLImageElement>(null);
  const afterRef = useRef<HTMLImageElement>(null);
  const beforeViewportRef = useRef<HTMLDivElement>(null);
  const afterViewportRef = useRef<HTMLDivElement>(null);
  const expectedScrollRef = useRef(new WeakMap<HTMLElement, IScrollPosition>());
  const center = useRef<INormalizedImagePoint>({ x: 0.5, y: 0.5 });
  const failedLabel =
    afterImage.status === "error" ? afterLabel : beforeImage.status === "error" ? beforeLabel : undefined;
  const differences = useImageDifferences({
    pairKey: `${before.src}\n${after.src}`,
    enabled: showDifferences,
    loaded: beforeImage.status === "loaded" && afterImage.status === "loaded",
    loadFailure: failedLabel ? `Pixels cannot be read: the ${failedLabel} image could not be loaded.` : undefined,
    beforeRef,
    afterRef,
  });
  const isShowingBefore = mode === "toggle" && isPeeking;
  const overlay =
    showDifferences && differences.status === "ready" ? <ImageDifferenceOverlay diff={differences.diff} /> : null;
  const fallback = failedLabel ? (
    <p data-slot="image-comparison-error" className="m-auto p-panel text-center text-sm text-muted-foreground">
      The {failedLabel} image could not be loaded.
    </p>
  ) : undefined;

  function setMode(next: ImageComparisonMode): void {
    setModeState(next);
    onModeChange?.(next);
  }
  function setOrientation(next: ImageComparisonOrientation): void {
    setOrientationState(next);
    onOrientationChange?.(next);
  }
  function setZoom(next: ImageZoom): void {
    setZoomState(next);
    onZoomChange?.(next);
  }
  function setShowDifferences(next: boolean): void {
    setShowDifferencesState(next);
    onShowDifferencesChange?.(next);
  }

  /** Mirrors one pane's scroll offsets onto the other, ignoring the scroll event that mirroring itself causes. */
  function syncScroll(source: HTMLDivElement, target: HTMLDivElement | null): void {
    const expected = expectedScrollRef.current.get(source);
    expectedScrollRef.current.delete(source);
    if (!target || (expected?.left === source.scrollLeft && expected.top === source.scrollTop)) return;
    const previous = { left: target.scrollLeft, top: target.scrollTop };
    target.scrollLeft = source.scrollLeft;
    target.scrollTop = source.scrollTop;
    if (target.scrollLeft !== previous.left || target.scrollTop !== previous.top) {
      expectedScrollRef.current.set(target, { left: target.scrollLeft, top: target.scrollTop });
    }
  }

  function renderAfterImage(className?: string): ReactElement {
    return (
      <img
        ref={afterRef}
        src={after.src}
        alt={after.alt}
        crossOrigin={after.crossOrigin}
        draggable={false}
        data-slot="image-comparison-after"
        className={cn("absolute inset-0 size-full bg-background select-none", className)}
        onLoad={afterHandlers.onLoad}
        onError={afterHandlers.onError}
      />
    );
  }

  function renderBeforeImage(className?: string, style?: CSSProperties): ReactElement {
    return (
      <img
        ref={beforeRef}
        src={before.src}
        alt={before.alt}
        crossOrigin={before.crossOrigin}
        draggable={false}
        data-slot="image-comparison-before"
        className={cn("absolute inset-0 size-full bg-background object-contain select-none", className)}
        style={style}
        onLoad={beforeHandlers.onLoad}
        onError={beforeHandlers.onError}
      />
    );
  }

  let content: ReactElement;
  if (mode === "side-by-side") {
    content = (
      <div
        data-slot="image-comparison-panes"
        className={cn("flex min-h-0 min-w-0 flex-1", orientation === "vertical" ? "flex-col" : "flex-row")}
      >
        <ComparisonPane header={<span>{beforeLabel}</span>}>
          <ImageViewport
            label={beforeLabel}
            zoom={zoom}
            naturalSize={afterImage.size}
            center={center}
            fallback={fallback}
            viewportRef={beforeViewportRef}
            onViewportScroll={(viewport) => syncScroll(viewport, afterViewportRef.current)}
          >
            {renderBeforeImage()}
            {overlay}
          </ImageViewport>
        </ComparisonPane>
        <Separator orientation={orientation === "vertical" ? "horizontal" : "vertical"} />
        <ComparisonPane header={<span>{afterLabel}</span>}>
          <ImageViewport
            label={afterLabel}
            zoom={zoom}
            naturalSize={afterImage.size}
            center={center}
            fallback={fallback}
            viewportRef={afterViewportRef}
            onViewportScroll={(viewport) => syncScroll(viewport, beforeViewportRef.current)}
          >
            {renderAfterImage()}
            {overlay}
          </ImageViewport>
        </ComparisonPane>
      </div>
    );
  } else if (mode === "swipe") {
    content = (
      <ComparisonPane
        header={
          <>
            <span>{beforeLabel}</span>
            <span>{afterLabel}</span>
          </>
        }
      >
        <ImageViewport
          label={`${beforeLabel} and ${afterLabel}`}
          zoom={zoom}
          naturalSize={afterImage.size}
          center={center}
          fallback={fallback}
        >
          {renderAfterImage()}
          {renderBeforeImage(undefined, { clipPath: `inset(0 ${100 - position}% 0 0)` })}
          {overlay}
          <ImageSwipeDivider
            value={position}
            onValueChange={setPosition}
            beforeLabel={beforeLabel}
            afterLabel={afterLabel}
          />
        </ImageViewport>
      </ComparisonPane>
    );
  } else {
    const showingLabel = isShowingBefore ? beforeLabel : afterLabel;
    content = (
      <ComparisonPane
        header={
          <span data-slot="image-comparison-showing" aria-live="polite">
            Showing {showingLabel}
          </span>
        }
      >
        <ImageViewport
          label={showingLabel}
          zoom={zoom}
          naturalSize={afterImage.size}
          center={center}
          fallback={fallback}
        >
          {renderAfterImage(isShowingBefore ? "invisible" : undefined)}
          {renderBeforeImage(isShowingBefore ? undefined : "invisible")}
          {overlay}
        </ImageViewport>
      </ComparisonPane>
    );
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="image-comparison"
      data-scroll="none"
      data-density={density}
      data-mode={mode}
      data-orientation={orientation}
      data-zoom={zoom}
      data-showing={isShowingBefore ? "before" : "after"}
      className="@container flex size-full min-h-0 min-w-0 flex-1"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col @3xl:flex-row">
        <div data-slot="image-comparison-stage" data-scroll="none" className="flex min-h-0 min-w-0 flex-1">
          {content}
        </div>
        {showToolbar && (
          <ImageComparisonToolbar
            mode={mode}
            onModeChange={setMode}
            orientation={orientation}
            onOrientationChange={setOrientation}
            zoom={zoom}
            onZoomChange={setZoom}
            showDifferences={showDifferences}
            onShowDifferencesChange={setShowDifferences}
            differences={differences}
            onPeekChange={setIsPeeking}
            beforeLabel={beforeLabel}
            afterLabel={afterLabel}
            beforeSize={beforeImage.size}
            afterSize={afterImage.size}
            density={density}
          />
        )}
      </div>
    </div>
  );
}

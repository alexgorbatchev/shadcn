import { useControlled } from "@base-ui/utils/useControlled";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { Separator } from "../Separator.js";
import { ImageComparisonToolbar } from "./ImageComparisonToolbar.js";
import { ImageDifferenceOverlay } from "./ImageDifferenceOverlay.js";
import { ImageSwipeDivider } from "./ImageSwipeDivider.js";
import { ImageViewport } from "./ImageViewport.js";
import { useElementSize } from "./hooks/useElementSize.js";
import { useImageDifferences } from "./hooks/useImageDifferences.js";
import { useImageLoad } from "./hooks/useImageLoad.js";
import type {
  IImageComparisonSource,
  IImageDiff,
  IImageDiffRegion,
  INormalizedImagePoint,
  ImageComparisonMode,
  ImageComparisonOrientation,
  ImageComparisonSide,
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
  /** Controlled image shown in `toggle` mode. */
  side?: ImageComparisonSide;
  /** Initial image shown in `toggle` mode when uncontrolled. Defaults to `after`. */
  defaultSide?: ImageComparisonSide;
  onSideChange?: (side: ImageComparisonSide) => void;
  /** Controlled side-by-side arrangement. Omit to choose from the stage shape (vertical when taller than wide). */
  orientation?: ImageComparisonOrientation;
  /** Initial side-by-side arrangement when uncontrolled. Omit to choose automatically from the stage shape. */
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
  /** Further controls in the toolbar row after the comparison controls, such as comment actions. */
  toolbar?: ReactNode;
  /** Content positioned over the before image (before pane in side-by-side, stage in toggle and swipe). */
  beforeOverlay?: ReactNode;
  /** Content positioned over the after image (after pane in side-by-side, stage in toggle and swipe). */
  afterOverlay?: ReactNode;
  /** Content positioned above the single stage in toggle and swipe modes, such as an active region tool. */
  stageOverlay?: ReactNode;
  /** Renders a Comment button on each highlighted changed region and calls this when activated. */
  onCommentDifference?: (region: IImageDiffRegion, index: number, diff: IImageDiff) => void;
  /** Receives swipe divider position updates (0–100, percent showing the before image). */
  onSwipePositionChange?: (position: number) => void;
  /** Runs before the stage keys while a comparison viewport has focus; call `preventDefault()` to replace a key. */
  onStageKeyDown?: (event: KeyboardEvent<HTMLDivElement>, side: ImageComparisonSide) => void;
  /** Further `aria-keyshortcuts` handled through `onStageKeyDown`, such as "R Enter". */
  stageKeyShortcuts?: string;
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

function getRegionCenter(region: IImageDiffRegion, diff: IImageDiff): INormalizedImagePoint {
  return {
    x: diff.width > 0 ? (region.x + region.width / 2) / diff.width : 0.5,
    y: diff.height > 0 ? (region.y + region.height / 2) / diff.height : 0.5,
  };
}

/**
 * Compares before and after images by toggling, swiping a divider, or showing them side by side. Every mode starts
 * fitted to the available space and offers original size with scrolling. A differently sized before image is drawn
 * inside the after image's box. Highlighting differences compares pixels on first use, caches the result per pair, and
 * steps through changed regions with buttons or N / Shift+N.
 */
export function ImageComparison({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  mode: modeProp,
  defaultMode = "toggle",
  onModeChange,
  side: sideProp,
  defaultSide = "after",
  onSideChange,
  orientation: orientationProp,
  defaultOrientation,
  onOrientationChange,
  zoom: zoomProp,
  defaultZoom = "fit",
  onZoomChange,
  showDifferences: showDifferencesProp,
  defaultShowDifferences = false,
  onShowDifferencesChange,
  showToolbar = true,
  toolbar,
  beforeOverlay,
  afterOverlay,
  stageOverlay,
  onCommentDifference,
  onSwipePositionChange,
  onStageKeyDown,
  stageKeyShortcuts,
  label = "Image comparison",
  density,
}: IImageComparisonProps): ReactElement {
  const [mode, setModeState] = useControlled({
    controlled: modeProp,
    default: defaultMode,
    name: "ImageComparison",
    state: "mode",
  });
  const [side, setSideState] = useControlled({
    controlled: sideProp,
    default: defaultSide,
    name: "ImageComparison",
    state: "side",
  });
  const [chosenOrientation, setOrientationState] = useControlled<ImageComparisonOrientation | undefined>({
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
  const pairKey = `${before.src}\n${after.src}`;
  const [isPeeking, setIsPeeking] = useState(false);
  const [position, setPosition] = useState(50);
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);
  const [changeAnnouncement, setChangeAnnouncement] = useState("");
  const [lastPairKey, setLastPairKey] = useState(pairKey);
  const [lastShowDifferences, setLastShowDifferences] = useState(showDifferences);
  if (lastPairKey !== pairKey || lastShowDifferences !== showDifferences) {
    setLastPairKey(pairKey);
    setLastShowDifferences(showDifferences);
    setActiveRegionIndex(0);
    setChangeAnnouncement("");
  }
  const [beforeImage, beforeHandlers] = useImageLoad(before.src);
  const [afterImage, afterHandlers] = useImageLoad(after.src);
  const beforeRef = useRef<HTMLImageElement>(null);
  const afterRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const singleViewportRef = useRef<HTMLDivElement>(null);
  const beforeViewportRef = useRef<HTMLDivElement>(null);
  const afterViewportRef = useRef<HTMLDivElement>(null);
  const expectedScrollRef = useRef(new WeakMap<HTMLElement, IScrollPosition>());
  const center = useRef<INormalizedImagePoint>({ x: 0.5, y: 0.5 });
  const stageSize = useElementSize(stageRef);
  const autoOrientation: ImageComparisonOrientation =
    stageSize && stageSize.height > stageSize.width ? "vertical" : "horizontal";
  const orientation = chosenOrientation ?? autoOrientation;
  const failedLabel =
    afterImage.status === "error" ? afterLabel : beforeImage.status === "error" ? beforeLabel : undefined;
  const differences = useImageDifferences({
    pairKey,
    enabled: showDifferences,
    loaded: beforeImage.status === "loaded" && afterImage.status === "loaded",
    loadFailure: failedLabel ? `Pixels cannot be read: the ${failedLabel} image could not be loaded.` : undefined,
    beforeRef,
    afterRef,
  });
  const regions = showDifferences && differences.status === "ready" ? differences.diff.regions : [];
  const clampedActiveIndex = regions.length > 0 ? Math.min(activeRegionIndex, regions.length - 1) : 0;
  // Holding the peek button shows the other image; the shown side applies in `toggle` mode only.
  const shownSide: ImageComparisonSide =
    mode !== "toggle" ? "after" : isPeeking ? (side === "before" ? "after" : "before") : side;
  const isShowingBefore = shownSide === "before";
  const diffOverlay =
    showDifferences && differences.status === "ready" ? (
      <ImageDifferenceOverlay diff={differences.diff} activeIndex={clampedActiveIndex} />
    ) : null;
  const interactiveDiffOverlay =
    showDifferences && differences.status === "ready" ? (
      <ImageDifferenceOverlay
        diff={differences.diff}
        activeIndex={clampedActiveIndex}
        onCommentRegion={
          onCommentDifference ? (region, index) => onCommentDifference(region, index, differences.diff) : undefined
        }
      />
    ) : null;
  const fallback = failedLabel ? (
    <p data-slot="image-comparison-error" className="m-auto p-panel text-center text-sm text-muted-foreground">
      The {failedLabel} image could not be loaded.
    </p>
  ) : undefined;

  function setMode(next: ImageComparisonMode): void {
    setModeState(next);
    onModeChange?.(next);
  }
  function setSide(next: ImageComparisonSide): void {
    setSideState(next);
    onSideChange?.(next);
  }
  function setOrientation(next: ImageComparisonOrientation): void {
    setOrientationState(next);
    onOrientationChange?.(next);
  }
  function scrollViewportToPoint(viewport: HTMLDivElement | null, point: INormalizedImagePoint): void {
    if (!viewport) return;
    const stageElement = viewport.querySelector<HTMLElement>("[data-slot=image-stage]");
    if (!stageElement || stageElement.offsetWidth <= 0 || stageElement.offsetHeight <= 0) return;
    const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const left = Math.round(
      Math.min(maxLeft, Math.max(0, point.x * stageElement.offsetWidth - viewport.clientWidth / 2)),
    );
    const top = Math.round(
      Math.min(maxTop, Math.max(0, point.y * stageElement.offsetHeight - viewport.clientHeight / 2)),
    );
    expectedScrollRef.current.set(viewport, { left, top });
    viewport.scrollTo({ left, top, behavior: "instant" });
  }
  function scrollAllViewportsToPoint(point: INormalizedImagePoint): void {
    scrollViewportToPoint(singleViewportRef.current, point);
    scrollViewportToPoint(beforeViewportRef.current, point);
    scrollViewportToPoint(afterViewportRef.current, point);
  }
  function stepChange(delta: -1 | 1): void {
    if (differences.status !== "ready" || differences.diff.regions.length === 0) return;
    const count = differences.diff.regions.length;
    const next = (clampedActiveIndex + delta + count) % count;
    const region = differences.diff.regions[next];
    if (!region) return;
    const point = getRegionCenter(region, differences.diff);
    center.current = point;
    setActiveRegionIndex(next);
    setChangeAnnouncement(`Change ${next + 1} of ${count}`);
    scrollAllViewportsToPoint(point);
  }
  function setZoom(next: ImageZoom): void {
    if (next === 1 && showDifferences && differences.status === "ready" && differences.diff.regions.length > 0) {
      const first = differences.diff.regions[0];
      if (first) {
        const point = getRegionCenter(first, differences.diff);
        center.current = point;
        setActiveRegionIndex(0);
        if (zoom === 1) scrollAllViewportsToPoint(point);
      }
    }
    setZoomState(next);
    onZoomChange?.(next);
  }
  function setShowDifferences(next: boolean): void {
    setShowDifferencesState(next);
    onShowDifferencesChange?.(next);
  }
  function handlePositionChange(next: number): void {
    setPosition(next);
    onSwipePositionChange?.(next);
  }
  function handleStageKey(event: KeyboardEvent<HTMLDivElement>, activeSide: ImageComparisonSide): void {
    onStageKeyDown?.(event, activeSide);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === "n" && regions.length > 0) {
      event.preventDefault();
      stepChange(event.shiftKey ? -1 : 1);
      return;
    }
    if (mode === "toggle" && !event.shiftKey && (key === "b" || key === "a")) {
      event.preventDefault();
      setSide(key === "b" ? "before" : "after");
    }
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
        className={cn(
          "absolute inset-0 size-full bg-background outline-1 -outline-offset-1 outline-media-edge select-none",
          className,
        )}
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
        className={cn(
          "absolute inset-0 size-full bg-background object-contain outline-1 -outline-offset-1 outline-media-edge select-none",
          className,
        )}
        style={style}
        onLoad={beforeHandlers.onLoad}
        onError={beforeHandlers.onError}
      />
    );
  }

  const sharedStageKeys = [regions.length > 0 ? "N Shift+N" : undefined, stageKeyShortcuts].filter(Boolean).join(" ");
  const toggleStageKeys = ["B A", sharedStageKeys].filter(Boolean).join(" ");

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
            onZoomChange={setZoom}
            fallback={fallback}
            viewportRef={beforeViewportRef}
            onViewportScroll={(viewport) => syncScroll(viewport, afterViewportRef.current)}
            onStageKeyDown={(event) => handleStageKey(event, "before")}
            stageKeyShortcuts={sharedStageKeys || undefined}
          >
            {renderBeforeImage()}
            {beforeOverlay}
            {diffOverlay}
          </ImageViewport>
        </ComparisonPane>
        <Separator orientation={orientation === "vertical" ? "horizontal" : "vertical"} />
        <ComparisonPane header={<span>{afterLabel}</span>}>
          <ImageViewport
            label={afterLabel}
            zoom={zoom}
            naturalSize={afterImage.size}
            center={center}
            onZoomChange={setZoom}
            fallback={fallback}
            viewportRef={afterViewportRef}
            onViewportScroll={(viewport) => syncScroll(viewport, beforeViewportRef.current)}
            onStageKeyDown={(event) => handleStageKey(event, "after")}
            stageKeyShortcuts={sharedStageKeys || undefined}
          >
            {renderAfterImage()}
            {afterOverlay}
            {interactiveDiffOverlay}
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
          onZoomChange={setZoom}
          fallback={fallback}
          viewportRef={singleViewportRef}
          onStageKeyDown={(event) => handleStageKey(event, position > 50 ? "before" : "after")}
          stageKeyShortcuts={sharedStageKeys || undefined}
        >
          {renderAfterImage()}
          {renderBeforeImage(undefined, { clipPath: `inset(0 ${100 - position}% 0 0)` })}
          {beforeOverlay}
          {afterOverlay}
          {interactiveDiffOverlay}
          <ImageSwipeDivider
            value={position}
            onValueChange={handlePositionChange}
            beforeLabel={beforeLabel}
            afterLabel={afterLabel}
          />
          {stageOverlay}
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
          onZoomChange={setZoom}
          fallback={fallback}
          viewportRef={singleViewportRef}
          onStageKeyDown={(event) => handleStageKey(event, shownSide)}
          stageKeyShortcuts={toggleStageKeys}
        >
          {renderAfterImage(isShowingBefore ? "invisible" : undefined)}
          {renderBeforeImage(isShowingBefore ? undefined : "invisible")}
          {beforeOverlay}
          {afterOverlay}
          {interactiveDiffOverlay}
          {stageOverlay}
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
      className="@container flex size-full min-h-0 min-w-0 flex-1 flex-col"
    >
      {showToolbar && (
        <ImageComparisonToolbar
          mode={mode}
          onModeChange={setMode}
          side={side}
          onSideChange={setSide}
          orientation={orientation}
          onOrientationChange={setOrientation}
          zoom={zoom}
          onZoomChange={setZoom}
          showDifferences={showDifferences}
          onShowDifferencesChange={setShowDifferences}
          differences={differences}
          activeRegionIndex={clampedActiveIndex}
          onStepChange={stepChange}
          onPeekChange={setIsPeeking}
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
          beforeSize={beforeImage.size}
          afterSize={afterImage.size}
          toolbar={toolbar}
          density={density}
        />
      )}
      <div ref={stageRef} data-slot="image-comparison-stage" data-scroll="none" className="flex min-h-0 min-w-0 flex-1">
        {content}
      </div>
      <p role="status" data-slot="image-comparison-change-announcement" className="sr-only">
        {changeAnnouncement}
      </p>
    </div>
  );
}

import { useControlled } from "@base-ui/utils/useControlled";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { Badge } from "../Badge.js";
import { Button } from "../Button.js";
import { Toggle } from "../Toggle.js";
import { ImageViewer } from "./ImageViewer.js";
import { ImageViewport } from "./ImageViewport.js";
import { ImageZoomToggle } from "./ImageZoomToggle.js";
import { useImageLoad } from "./hooks/useImageLoad.js";
import type { INormalizedImagePoint, ImageZoom } from "./types.js";

export interface IImageGalleryItem {
  /** Stable identity of the item, such as an option value. */
  key: string;
  src: string;
  alt: string;
  /** The item's name, used in the step announcement: "Bold · 2 of 3". */
  label: string;
  /** Short consequence or caption shown on the item's card in Compare all mode. */
  description?: string;
  /** Highlights this card in Compare all mode as the currently selected choice. */
  selected?: boolean;
}

export interface IImageGalleryProps extends IDensityProps {
  items: readonly IImageGalleryItem[];
  /** The shown item's position in `items`. */
  index: number;
  onIndexChange: (index: number) => void;
  /** Width in CSS pixels the first shown image had where it was opened from; see `ImageViewer`. */
  openingWidth?: number;
  /** Accessible name of the stage, followed by the zoom percent. Defaults to the shown item's label. */
  label?: string;
  /** Accessible name of the step back button. Defaults to "Previous image". */
  previousLabel?: string;
  /** Accessible name of the step forward button. Defaults to "Next image". */
  nextLabel?: string;
  /** Further controls in the toolbar row after the stepper, such as a Choose action. */
  toolbar?: ReactNode;
  /** Content positioned over the shown image; see `ImageViewer`. */
  overlay?: ReactNode;
  imageRef?: Ref<HTMLImageElement>;
  stageRef?: Ref<HTMLDivElement>;
  /** Runs for keys on the focused stage before the gallery's own; call `preventDefault()` to replace one. */
  onStageKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Further `aria-keyshortcuts` of the stage, such as "R". */
  stageKeyShortcuts?: string;
  /** Controlled side-by-side mode showing every item together with synchronized scrolling. */
  compareAll?: boolean;
  /** Initial side-by-side mode when uncontrolled. Defaults to `false`. */
  defaultCompareAll?: boolean;
  onCompareAllChange?: (compareAll: boolean) => void;
  /** Offers the Compare all toggle when there are at least two items. Enabled automatically when `renderItemFooter`, `compareAll`, or `onCompareAllChange` is passed. */
  allowCompareAll?: boolean;
  /** Label of the Compare all toggle button. Defaults to "Compare all". */
  compareAllLabel?: string;
  /** Footer rendered below each item in Compare all mode, such as a per-option Choose button. */
  renderItemFooter?: (item: IImageGalleryItem, index: number) => ReactNode;
}

interface IScrollPosition {
  left: number;
  top: number;
}

interface ICompareAllPaneProps {
  item: IImageGalleryItem;
  zoom: ImageZoom;
  center: RefObject<INormalizedImagePoint>;
  onZoomChange: (zoom: ImageZoom) => void;
  viewportRef: (node: HTMLDivElement | null) => void;
  onViewportScroll: (viewport: HTMLDivElement) => void;
  footer?: ReactNode;
}

function CompareAllPane({
  item,
  zoom,
  center,
  onZoomChange,
  viewportRef,
  onViewportScroll,
  footer,
}: ICompareAllPaneProps): ReactElement {
  const [image, imageHandlers] = useImageLoad(item.src);
  return (
    <section
      aria-label={item.label}
      data-slot="image-gallery-compare-pane"
      data-selected={item.selected ? "" : undefined}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-md border bg-background",
        item.selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div
        data-slot="image-gallery-compare-header"
        className="flex h-control shrink-0 items-center justify-between gap-2 border-b border-border px-control-x text-xs font-medium text-foreground"
      >
        <span className="truncate">{item.label}</span>
        {item.selected && <Badge variant="default">Chosen</Badge>}
      </div>
      <div className={cn("flex min-h-0 w-full shrink-0", zoom === "fit" ? "aspect-[16/10]" : "h-[min(60dvh,32rem)]")}>
        <ImageViewport
          label={item.label}
          zoom={zoom}
          naturalSize={image.size}
          center={center}
          onZoomChange={onZoomChange}
          viewportRef={viewportRef}
          onViewportScroll={onViewportScroll}
          allowVerticalScroll
          fallback={
            image.status === "error" ? (
              <p className="m-auto p-panel text-center text-sm text-muted-foreground">Image could not be loaded.</p>
            ) : undefined
          }
        >
          <img
            src={item.src}
            alt={item.alt}
            draggable={false}
            data-slot="image-gallery-compare-image"
            className="block size-full outline-1 -outline-offset-1 outline-media-edge select-none"
            onLoad={imageHandlers.onLoad}
            onError={imageHandlers.onError}
          />
        </ImageViewport>
      </div>
      {(item.description || (footer !== undefined && footer !== null)) && (
        <div
          data-slot="image-gallery-compare-footer"
          className="flex shrink-0 flex-col gap-2 border-t border-border p-panel-sm"
        >
          {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
          {footer !== undefined && footer !== null && (
            <div className="flex items-center justify-between gap-2">{footer}</div>
          )}
        </div>
      )}
    </section>
  );
}

/** Whether the viewer around the focused stage shows the whole image, where Left and Right cannot mean panning. */
function isFitted(stage: HTMLElement): boolean {
  return stage.closest("[data-slot=image-viewer]")?.getAttribute("data-zoom") === "fit";
}

/**
 * Steps through a set of images in one `ImageViewer`, keeping its zoom and viewed position, so the same area of each
 * image can be compared. The toolbar holds the zoom bar, Previous, "2 of 3" and Next, an optional Compare all toggle,
 * then `toolbar`; Left and Right step on the focused stage only at Fit, where arrows do not pan. Compare all shows
 * every item side by side with synchronized scrolling and optional per-item footers. Compose it inside `MediaShell`
 * and name the shell after the shown item.
 */
export function ImageGallery({
  items,
  index,
  onIndexChange,
  openingWidth,
  label,
  previousLabel = "Previous image",
  nextLabel = "Next image",
  toolbar,
  overlay,
  imageRef,
  stageRef,
  onStageKeyDown,
  stageKeyShortcuts,
  compareAll: compareAllProp,
  defaultCompareAll = false,
  onCompareAllChange,
  allowCompareAll,
  compareAllLabel = "Compare all",
  renderItemFooter,
  density,
}: IImageGalleryProps): ReactElement {
  const [announcement, setAnnouncement] = useState("");
  const [compareZoom, setCompareZoom] = useState<ImageZoom>("fit");
  const [isComparingAll, setCompareAllState] = useControlled({
    controlled: compareAllProp,
    default: defaultCompareAll,
    name: "ImageGallery",
    state: "compareAll",
  });
  const compareCenter = useRef<INormalizedImagePoint>({ x: 0.5, y: 0.5 });
  const compareViewports = useRef<Map<string, HTMLDivElement>>(new Map());
  const expectedScrollRef = useRef(new WeakMap<HTMLElement, IScrollPosition>());
  const item = items[index];
  const count = items.length;
  const canCompareAll =
    count > 1 &&
    (allowCompareAll ??
      (compareAllProp !== undefined || onCompareAllChange !== undefined || renderItemFooter !== undefined));

  function setCompareAll(next: boolean): void {
    setCompareAllState(next);
    onCompareAllChange?.(next);
  }

  function step(next: number): void {
    const target = items[next];
    if (!target) return;
    setAnnouncement(`${target.label} · ${next + 1} of ${count}`);
    onIndexChange(next);
  }

  function handleStageKey(event: KeyboardEvent<HTMLDivElement>): void {
    onStageKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (!isFitted(event.currentTarget)) return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? index - 1 : index + 1);
  }

  function syncCompareScroll(sourceKey: string, source: HTMLDivElement): void {
    const expected = expectedScrollRef.current.get(source);
    expectedScrollRef.current.delete(source);
    if (expected?.left === source.scrollLeft && expected.top === source.scrollTop) return;
    for (const [key, target] of compareViewports.current) {
      if (key === sourceKey) continue;
      const previous = { left: target.scrollLeft, top: target.scrollTop };
      target.scrollLeft = source.scrollLeft;
      target.scrollTop = source.scrollTop;
      if (target.scrollLeft !== previous.left || target.scrollTop !== previous.top) {
        expectedScrollRef.current.set(target, { left: target.scrollLeft, top: target.scrollTop });
      }
    }
  }

  if (!item) return <div data-slot="image-gallery" data-density={density} />;

  if (canCompareAll && isComparingAll) {
    return (
      <div
        data-slot="image-gallery"
        data-mode="compare-all"
        data-scroll="none"
        data-density={density}
        className="@container flex size-full min-h-0 min-w-0 flex-1 flex-col gap-2"
      >
        <div
          data-slot="image-gallery-toolbar"
          className="flex shrink-0 flex-wrap items-center gap-control-gap *:shrink-0"
        >
          <ImageZoomToggle zoom={compareZoom} onZoomChange={setCompareZoom} density={density} />
          <Toggle variant="outline" size="sm" density={density} pressed onPressedChange={setCompareAll}>
            {compareAllLabel}
          </Toggle>
        </div>
        <div
          data-slot="image-gallery-compare-grid"
          className={cn(
            "grid min-h-0 min-w-0 flex-1 content-start grid-cols-1 gap-3 overflow-y-auto pb-2",
            count === 2 ? "@2xl:grid-cols-2" : "@xl:grid-cols-2 @3xl:grid-cols-3",
          )}
        >
          {items.map((entry, entryIndex) => (
            <CompareAllPane
              key={entry.key}
              item={entry}
              zoom={compareZoom}
              center={compareCenter}
              onZoomChange={setCompareZoom}
              viewportRef={(node) => {
                if (node) compareViewports.current.set(entry.key, node);
                else compareViewports.current.delete(entry.key);
              }}
              onViewportScroll={(viewport) => syncCompareScroll(entry.key, viewport)}
              footer={renderItemFooter?.(entry, entryIndex)}
            />
          ))}
        </div>
        <p role="status" data-slot="image-gallery-status" className="sr-only">
          {announcement}
        </p>
      </div>
    );
  }

  return (
    <div
      data-slot="image-gallery"
      data-mode="single"
      data-scroll="none"
      data-density={density}
      className="flex size-full min-h-0 min-w-0 flex-1 flex-col"
    >
      <ImageViewer
        src={item.src}
        alt={item.alt}
        label={label ?? item.label}
        openingWidth={openingWidth}
        showZoomControl
        imageRef={imageRef}
        stageRef={stageRef}
        overlay={overlay}
        onStageKeyDown={handleStageKey}
        stageKeyShortcuts={stageKeyShortcuts}
        density={density}
        toolbar={
          <>
            <div
              role="group"
              aria-label="Images"
              data-slot="image-gallery-stepper"
              className="flex items-center gap-control-gap"
            >
              <Button
                variant="outline"
                size="icon-sm"
                density={density}
                aria-label={previousLabel}
                disabledReason={index === 0 ? "This is the first image" : undefined}
                onClick={() => step(index - 1)}
              >
                <ChevronLeftIcon />
              </Button>
              <span data-slot="image-gallery-position" className="text-xs text-muted-foreground tabular-nums">
                {index + 1} of {count}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                density={density}
                aria-label={nextLabel}
                disabledReason={index === count - 1 ? "This is the last image" : undefined}
                onClick={() => step(index + 1)}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            {canCompareAll && (
              <Toggle variant="outline" size="sm" density={density} pressed={false} onPressedChange={setCompareAll}>
                {compareAllLabel}
              </Toggle>
            )}
            {toolbar}
          </>
        }
      />
      <p role="status" data-slot="image-gallery-status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

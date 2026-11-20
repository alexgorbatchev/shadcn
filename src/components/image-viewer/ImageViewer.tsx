import { useControlled } from "@base-ui/utils/useControlled";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from "react";
import type { IDensityProps } from "../../density/types.js";
import { ImageViewport } from "./ImageViewport.js";
import { ImageZoomControl } from "./ImageZoomControl.js";
import { useElementSize } from "./hooks/useElementSize.js";
import { useImageLoad } from "./hooks/useImageLoad.js";
import { getImageZoomScales, getOpeningImageZoom, resolveImageZoomScale } from "./imageZoom.js";
import type { INormalizedImagePoint, ImageZoom } from "./types.js";

export interface IImageViewerProps extends IDensityProps {
  src: string;
  alt: string;
  /** CORS mode for the image request. */
  crossOrigin?: "anonymous" | "use-credentials";
  /** Controlled zoom. */
  zoom?: ImageZoom;
  /**
   * Initial zoom when uncontrolled. Defaults to the opening zoom: `fit`, or `fit-width` for an image taller than the
   * viewport, and never narrower than `openingWidth`.
   */
  defaultZoom?: ImageZoom;
  onZoomChange?: (zoom: ImageZoom) => void;
  /**
   * Width in CSS pixels the image had where it was opened from, such as a page thumbnail. Without a controlled or
   * default zoom, the viewer opens no narrower than this.
   */
  openingWidth?: number;
  /**
   * Shows the zoom bar (Fit, Fit width, zoom out, percent, zoom in) in a toolbar row above the image. Place
   * `ImageZoomToggle` yourself instead to put a simpler control in a header.
   */
  showZoomControl?: boolean;
  /** Further controls in the toolbar row after the zoom bar, such as comment actions. Renders the row on its own too. */
  toolbar?: ReactNode;
  /**
   * Content sized and positioned exactly over the rendered image at every zoom level, such as region selections or
   * markers. Position children in percentages, and normalize pointer positions with `getNormalizedImagePoint`.
   */
  overlay?: ReactNode;
  /** The rendered `<img>`, whose bounding box is the rendered image box. */
  imageRef?: Ref<HTMLImageElement>;
  /** The overlay box, rendered only when `overlay` is provided. */
  overlayRef?: Ref<HTMLDivElement>;
  /** The focusable stage that scrolls the image. */
  stageRef?: Ref<HTMLDivElement>;
  /** Accessible name of the stage, followed by the zoom percent. Defaults to `alt`. */
  label?: string;
  /**
   * Runs for keys pressed while the stage has focus, before its own zoom and pan keys; call `preventDefault()` to
   * replace one. Declare the keys it handles in `stageKeyShortcuts`.
   */
  onStageKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Further `aria-keyshortcuts` of the stage, such as "R". */
  stageKeyShortcuts?: string;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Shows one image inside a native scroll viewport that fills its container, framed so its edge shows in both themes.
 * `fit` scales the image down to show all of it; `fit-width` fills the width and scrolls vertically; numeric zooms run
 * up to 400% and keep the viewed center. Drag pans, pinch and Mod+wheel zoom, and the focused stage takes +, −, 0, 1
 * and arrow keys. Touch gestures never reach overlay content unless it handles them itself, such as
 * `ImageRegionSelect` while a region tool is on.
 */
export function ImageViewer({
  src,
  alt,
  crossOrigin,
  zoom: zoomProp,
  defaultZoom,
  onZoomChange,
  openingWidth,
  showZoomControl = false,
  toolbar,
  overlay,
  imageRef,
  overlayRef,
  stageRef,
  label,
  onStageKeyDown,
  stageKeyShortcuts,
  onLoad,
  onError,
  density,
}: IImageViewerProps): ReactElement {
  const [zoom, setZoomState] = useControlled<ImageZoom | undefined>({
    controlled: zoomProp,
    default: defaultZoom,
    name: "ImageViewer",
    state: "zoom",
  });
  const center = useRef<INormalizedImagePoint>({ x: 0.5, y: 0.5 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const mergedStageRef = useMergedRefs(viewportRef, stageRef);
  const viewportSize = useElementSize(viewportRef);
  const [image, imageHandlers] = useImageLoad(src);
  const [openingZoom, setOpeningZoom] = useState<ImageZoom>();
  const naturalSize = image.size;
  const scales = naturalSize && viewportSize ? getImageZoomScales(naturalSize, viewportSize) : undefined;

  useIsoLayoutEffect(() => {
    // Choose the opening zoom once, from the first measured image and viewport.
    if (zoom !== undefined || openingZoom !== undefined || !naturalSize || !viewportSize) return;
    const opening = getOpeningImageZoom(naturalSize, viewportSize, openingWidth);
    const stageHeight =
      naturalSize.height * resolveImageZoomScale(opening, getImageZoomScales(naturalSize, viewportSize));
    // A capture larger than the stage opens at its top edge, where reading starts, horizontally centered.
    if (stageHeight > viewportSize.height) center.current = { x: 0.5, y: viewportSize.height / 2 / stageHeight };
    setOpeningZoom(opening);
  }, [naturalSize, openingWidth, openingZoom, viewportSize, zoom]);

  const shownZoom: ImageZoom = zoom ?? openingZoom ?? "fit";
  const scale = scales ? resolveImageZoomScale(shownZoom, scales) : undefined;

  function setZoom(next: ImageZoom): void {
    setZoomState(next);
    setOpeningZoom(next);
    onZoomChange?.(next);
  }

  return (
    <div
      data-slot="image-viewer"
      data-scroll="none"
      data-density={density}
      data-zoom={shownZoom}
      data-status={image.status}
      className="flex size-full min-h-0 min-w-0 flex-1 flex-col gap-2"
    >
      {(showZoomControl || toolbar !== undefined) && (
        <div
          data-slot="image-viewer-toolbar"
          className="flex shrink-0 flex-nowrap items-center gap-control-gap overflow-x-auto overscroll-x-contain *:shrink-0"
        >
          {showZoomControl && (
            <ImageZoomControl zoom={shownZoom} scale={scale} scales={scales} onZoomChange={setZoom} density={density} />
          )}
          {toolbar}
        </div>
      )}
      <ImageViewport
        label={label ?? alt}
        zoom={shownZoom}
        naturalSize={naturalSize}
        center={center}
        viewportRef={mergedStageRef}
        onZoomChange={setZoom}
        onStageKeyDown={onStageKeyDown}
        stageKeyShortcuts={stageKeyShortcuts}
        fallback={
          image.status === "error" ? (
            <p data-slot="image-viewer-error" className="m-auto p-panel text-center text-sm text-muted-foreground">
              Image could not be loaded.
            </p>
          ) : undefined
        }
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          crossOrigin={crossOrigin}
          draggable={false}
          data-slot="image-viewer-image"
          className="block size-full outline-1 -outline-offset-1 outline-media-edge select-none"
          onLoad={(event) => {
            imageHandlers.onLoad(event);
            onLoad?.(event);
          }}
          onError={(event) => {
            imageHandlers.onError();
            onError?.(event);
          }}
        />
        {overlay !== undefined && (
          <div ref={overlayRef} data-slot="image-viewer-overlay" className="absolute inset-0">
            {overlay}
          </div>
        )}
      </ImageViewport>
    </div>
  );
}

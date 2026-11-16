import { useControlled } from "@base-ui/utils/useControlled";
import { useRef, type ReactElement, type ReactNode, type Ref, type SyntheticEvent } from "react";
import type { IDensityProps } from "../../density/types.js";
import { ImageViewport } from "./ImageViewport.js";
import { ImageZoomToggle } from "./ImageZoomToggle.js";
import { useImageLoad } from "./hooks/useImageLoad.js";
import type { INormalizedImagePoint, ImageZoom } from "./types.js";

export interface IImageViewerProps extends IDensityProps {
  src: string;
  alt: string;
  /** CORS mode for the image request. */
  crossOrigin?: "anonymous" | "use-credentials";
  /** Controlled zoom. */
  zoom?: ImageZoom;
  /** Initial zoom when uncontrolled. Defaults to `fit`. */
  defaultZoom?: ImageZoom;
  onZoomChange?: (zoom: ImageZoom) => void;
  /** Shows the built-in zoom toggle above the image. Place `ImageZoomToggle` yourself to put it in a header. */
  showZoomControl?: boolean;
  /**
   * Content sized and positioned exactly over the rendered image at every zoom level, such as region selections or
   * markers. Position children in percentages, and normalize pointer positions with `getNormalizedImagePoint`.
   */
  overlay?: ReactNode;
  /** The rendered `<img>`, whose bounding box is the rendered image box. */
  imageRef?: Ref<HTMLImageElement>;
  /** The overlay box, rendered only when `overlay` is provided. */
  overlayRef?: Ref<HTMLDivElement>;
  /** Accessible name of the scroll region. Defaults to `alt`. */
  label?: string;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Shows one image inside a native scroll viewport that fills its container. `fit` scales the image down to the
 * viewport without scrolling; `original` shows natural size and scrolls where the image is larger than the viewport.
 */
export function ImageViewer({
  src,
  alt,
  crossOrigin,
  zoom: zoomProp,
  defaultZoom = "fit",
  onZoomChange,
  showZoomControl = false,
  overlay,
  imageRef,
  overlayRef,
  label,
  onLoad,
  onError,
  density,
}: IImageViewerProps): ReactElement {
  const [zoom, setZoomState] = useControlled({
    controlled: zoomProp,
    default: defaultZoom,
    name: "ImageViewer",
    state: "zoom",
  });
  const center = useRef<INormalizedImagePoint>({ x: 0.5, y: 0.5 });
  const [image, imageHandlers] = useImageLoad(src);

  function setZoom(next: ImageZoom): void {
    setZoomState(next);
    onZoomChange?.(next);
  }

  return (
    <div
      data-slot="image-viewer"
      data-scroll="none"
      data-density={density}
      data-zoom={zoom}
      data-status={image.status}
      className="flex size-full min-h-0 min-w-0 flex-1 flex-col gap-2"
    >
      {showZoomControl && (
        <div data-slot="image-viewer-toolbar" className="flex shrink-0 justify-end">
          <ImageZoomToggle zoom={zoom} onZoomChange={setZoom} density={density} />
        </div>
      )}
      <ImageViewport
        label={label ?? alt}
        zoom={zoom}
        naturalSize={image.size}
        center={center}
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
          className="block size-full select-none"
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

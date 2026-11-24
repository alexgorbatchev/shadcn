import { useControlled } from "@base-ui/utils/useControlled";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useMemo, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode, type Ref } from "react";
import type { IDensityProps } from "../../density/types.js";
import { DiagramSurface } from "./DiagramSurface.js";
import { ImageViewport } from "./ImageViewport.js";
import { ImageZoomControl } from "./ImageZoomControl.js";
import { useElementSize } from "./hooks/useElementSize.js";
import { getImageZoomScales, getOpeningImageZoom, resolveImageZoomScale } from "./imageZoom.js";
import { getDiagramSvgSize } from "./prepareDiagramSvg.js";
import type { IImageSize, INormalizedImagePoint, ImageZoom } from "./types.js";

export interface IDiagramViewerProps extends IDensityProps {
  /** Rendered SVG markup for the live diagram. */
  svg: string;
  /** Accessible name of both the diagram and the zoom stage (followed by the zoom percent). */
  label: string;
  /** Optional plain-language description attached to the live SVG via `aria-describedby`. */
  description?: string;
  /** Natural size of the diagram; inferred from the SVG's `viewBox` when omitted. */
  naturalSize?: IImageSize;
  /** Controlled zoom. */
  zoom?: ImageZoom;
  /**
   * Initial zoom when uncontrolled. Defaults to the opening zoom: `fit`, or `fit-width` for tall diagrams, and never
   * narrower than `openingWidth`.
   */
  defaultZoom?: ImageZoom;
  onZoomChange?: (zoom: ImageZoom) => void;
  /**
   * Width in CSS pixels the diagram had where it was opened from on the page. Without a controlled or default zoom,
   * the viewer opens no narrower than this so labels stay at least as large as inline under browser zoom.
   */
  openingWidth?: number;
  /** Shows the zoom bar (Fit, Fit width, zoom out, percent, zoom in) in a toolbar row above the diagram. */
  showZoomControl?: boolean;
  /** Further controls in the toolbar row after the zoom bar, such as Comment on diagram. */
  toolbar?: ReactNode;
  /** The focusable stage that scrolls and pans the diagram. */
  stageRef?: Ref<HTMLDivElement>;
  /** Runs for keys pressed while the stage has focus, before its own zoom and pan keys. */
  onStageKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Further `aria-keyshortcuts` of the stage. */
  stageKeyShortcuts?: string;
}

/**
 * Displays a live vector SVG diagram inside the shared zoom-and-pan stage (`ImageViewport`) with the same zoom bar,
 * keyboard shortcuts (`+`, `-`, `0`, `1`, arrows), drag/pinch/Mod+wheel gestures, and `openingWidth` floor as
 * `ImageViewer`. Keeps diagram labels as live vector text rather than rasterizing into an `<img>`.
 */
export function DiagramViewer({
  svg,
  label,
  description,
  naturalSize: naturalSizeProp,
  zoom: zoomProp,
  defaultZoom,
  onZoomChange,
  openingWidth,
  showZoomControl = false,
  toolbar,
  stageRef,
  onStageKeyDown,
  stageKeyShortcuts,
  density,
}: IDiagramViewerProps): ReactElement {
  const [zoom, setZoomState] = useControlled<ImageZoom | undefined>({
    controlled: zoomProp,
    default: defaultZoom,
    name: "DiagramViewer",
    state: "zoom",
  });
  const center = useRef<INormalizedImagePoint>({ x: 0.5, y: 0.5 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const mergedStageRef = useMergedRefs(viewportRef, stageRef);
  const viewportSize = useElementSize(viewportRef);
  const parsedSize = useMemo(() => getDiagramSvgSize(svg), [svg]);
  const naturalSize = naturalSizeProp ?? parsedSize;
  const [openingZoom, setOpeningZoom] = useState<ImageZoom>();
  const scales = naturalSize && viewportSize ? getImageZoomScales(naturalSize, viewportSize) : undefined;

  useIsoLayoutEffect(() => {
    if (zoom !== undefined || openingZoom !== undefined || !naturalSize || !viewportSize) return;
    const opening = getOpeningImageZoom(naturalSize, viewportSize, openingWidth);
    const stageHeight =
      naturalSize.height * resolveImageZoomScale(opening, getImageZoomScales(naturalSize, viewportSize));
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
      data-slot="diagram-viewer"
      data-scroll="none"
      data-density={density}
      data-zoom={shownZoom}
      className="flex size-full min-h-0 min-w-0 flex-1 flex-col gap-2"
    >
      {(showZoomControl || toolbar !== undefined) && (
        <div
          data-slot="diagram-viewer-toolbar"
          className="flex shrink-0 flex-wrap items-center gap-control-gap *:shrink-0"
        >
          {showZoomControl && (
            <ImageZoomControl zoom={shownZoom} scale={scale} scales={scales} onZoomChange={setZoom} density={density} />
          )}
          {toolbar}
        </div>
      )}
      <ImageViewport
        label={label}
        zoom={shownZoom}
        naturalSize={naturalSize}
        center={center}
        viewportRef={mergedStageRef}
        onZoomChange={setZoom}
        onStageKeyDown={onStageKeyDown}
        stageKeyShortcuts={stageKeyShortcuts}
      >
        <div
          data-slot="diagram-viewer-frame"
          className="size-full bg-card outline-1 -outline-offset-1 outline-media-edge"
        >
          <DiagramSurface svg={svg} label={label} description={description} fit="fill" />
        </div>
      </ImageViewport>
    </div>
  );
}

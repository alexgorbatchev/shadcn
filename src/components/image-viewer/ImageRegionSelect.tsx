import { useRef, useState, type PointerEvent, type ReactElement } from "react";
import { getNormalizedImagePoint } from "./getNormalizedImagePoint.js";
import { formatImageRegion, getImageRegionFromCorners, placeImageRegion } from "./imageRegion.js";
import { ImageRegionMarker } from "./ImageRegionMarker.js";
import type { IImageRect, INormalizedImagePoint } from "./types.js";

export interface IImageRegionSelectProps {
  /** The placed region, drawn until it changes or is removed. */
  region?: IImageRect;
  /** Receives each placed region in normalized image coordinates, each value from 0 to 1. */
  onRegionChange: (region: IImageRect) => void;
}

/** Pointer travel, in CSS pixels, below which a press is a click rather than a region drag. */
const MINIMUM_DRAG = 4;

interface IDrag {
  pointerId: number;
  start: INormalizedImagePoint;
}

/** A click that placed a region; a second click before anything else changes it makes the two clicks its corners. */
interface IPendingClick {
  point: INormalizedImagePoint;
  region: IImageRect;
}

function toRegion(start: INormalizedImagePoint, end: INormalizedImagePoint): IImageRect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function toBox(region: IImageRect): { left: string; top: string; width: string; height: string } {
  return {
    left: `${region.x * 100}%`,
    top: `${region.y * 100}%`,
    width: `${region.width * 100}%`,
    height: `${region.height * 100}%`,
  };
}

/**
 * Region tool for an `ImageViewer` overlay. A drag with one pointer draws a region; a click without a drag places a
 * region half the image's size centred on the click, and a second click before anything else changes it makes the two
 * clicks opposite corners, the non-drag alternative WCAG 2.5.7 asks for. Pair it with `applyImageRegionKey` and
 * `placeImageRegion` on the stage's keys and `ImageRegionFields` for typed values. Render it only while the person has
 * turned a region tool on, so pans and pinches stay navigation otherwise. Its pointer is kept from panning the stage; a
 * second finger cancels the drawing and pinch-zooms instead.
 */
export function ImageRegionSelect({ region, onRegionChange }: IImageRegionSelectProps): ReactElement {
  const drag = useRef<IDrag | null>(null);
  const pendingClick = useRef<IPendingClick | null>(null);
  const [draft, setDraft] = useState<IImageRect>();
  const point = (event: PointerEvent<HTMLDivElement>): INormalizedImagePoint =>
    getNormalizedImagePoint(event, event.currentTarget.getBoundingClientRect());

  function cancel(): void {
    drag.current = null;
    setDraft(undefined);
  }

  function click(at: INormalizedImagePoint): void {
    const pending = pendingClick.current;
    if (pending && pending.region === region) {
      pendingClick.current = null;
      onRegionChange(getImageRegionFromCorners(pending.point, at));
      return;
    }
    const placed = placeImageRegion(at);
    pendingClick.current = { point: at, region: placed };
    onRegionChange(placed);
  }

  const shown = draft ?? region;
  return (
    <div
      data-slot="image-region-select"
      className="absolute inset-0 cursor-crosshair touch-none"
      onPointerDown={(event) => {
        if (drag.current) {
          // A second pointer is a pinch: stop drawing and let the stage zoom.
          if (drag.current.pointerId !== event.pointerId) cancel();
          return;
        }
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointerId: event.pointerId, start: point(event) };
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (current?.pointerId !== event.pointerId) return;
        const moved = toRegion(current.start, point(event));
        const bounds = event.currentTarget.getBoundingClientRect();
        if (moved.width * bounds.width >= MINIMUM_DRAG || moved.height * bounds.height >= MINIMUM_DRAG) setDraft(moved);
      }}
      onPointerUp={(event) => {
        const current = drag.current;
        if (current?.pointerId !== event.pointerId) return;
        cancel();
        const end = point(event);
        const dragged = toRegion(current.start, end);
        const bounds = event.currentTarget.getBoundingClientRect();
        if (dragged.width * bounds.width < MINIMUM_DRAG && dragged.height * bounds.height < MINIMUM_DRAG) {
          click(end);
          return;
        }
        pendingClick.current = null;
        onRegionChange(dragged);
      }}
      onPointerCancel={cancel}
    >
      {shown && (
        <ImageRegionMarker
          variant="draft"
          role={draft ? undefined : "img"}
          aria-hidden={draft ? "true" : undefined}
          aria-label={draft ? undefined : formatImageRegion(shown)}
          data-slot="image-region-select-draft"
          region={toBox(shown)}
        />
      )}
    </div>
  );
}

import { useRef, useState, type PointerEvent, type ReactElement } from "react";
import { getNormalizedImagePoint } from "./getNormalizedImagePoint.js";
import { ImageRegionMarker } from "./ImageRegionMarker.js";
import type { IImageRect, INormalizedImagePoint } from "./types.js";

export interface IImageRegionSelectProps {
  /** Receives the drawn region in normalized image coordinates, each value from 0 to 1. */
  onSelect: (region: IImageRect) => void;
}

/** Pointer travel, in CSS pixels, below which a press is a click rather than a region drag. */
const MINIMUM_DRAG = 4;

function toRegion(start: INormalizedImagePoint, end: INormalizedImagePoint): IImageRect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

/**
 * Region tool for an `ImageViewer` overlay: a drag with one pointer draws a region and reports it in normalized image
 * coordinates. Render it only while the person has turned a region tool on, so pans and pinches stay navigation
 * otherwise. Its pointer is kept from panning the stage; a second finger cancels the drawing and pinch-zooms instead.
 */
export function ImageRegionSelect({ onSelect }: IImageRegionSelectProps): ReactElement {
  const drag = useRef<{ pointerId: number; start: INormalizedImagePoint } | null>(null);
  const [draft, setDraft] = useState<IImageRect>();
  const point = (event: PointerEvent<HTMLDivElement>): INormalizedImagePoint =>
    getNormalizedImagePoint(event, event.currentTarget.getBoundingClientRect());

  function cancel(): void {
    drag.current = null;
    setDraft(undefined);
  }

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
        setDraft(undefined);
      }}
      onPointerMove={(event) => {
        if (drag.current?.pointerId === event.pointerId) setDraft(toRegion(drag.current.start, point(event)));
      }}
      onPointerUp={(event) => {
        const current = drag.current;
        if (current?.pointerId !== event.pointerId) return;
        cancel();
        const region = toRegion(current.start, point(event));
        const bounds = event.currentTarget.getBoundingClientRect();
        if (region.width * bounds.width < MINIMUM_DRAG && region.height * bounds.height < MINIMUM_DRAG) return;
        onSelect(region);
      }}
      onPointerCancel={cancel}
    >
      {draft && (
        <ImageRegionMarker
          variant="draft"
          aria-hidden="true"
          data-slot="image-region-select-draft"
          region={{
            left: `${draft.x * 100}%`,
            top: `${draft.y * 100}%`,
            width: `${draft.width * 100}%`,
            height: `${draft.height * 100}%`,
          }}
        />
      )}
    </div>
  );
}

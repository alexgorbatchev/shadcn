import type { ReactElement } from "react";
import type { IImageDiff } from "./types.js";
import { ImageRegionMarker } from "./ImageRegionMarker.js";

interface IImageDifferenceOverlayProps {
  diff: IImageDiff;
}

function toPercent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

/** Outlines changed regions over the after image box; percentages keep the outlines aligned at every zoom level. */
export function ImageDifferenceOverlay({ diff }: IImageDifferenceOverlayProps): ReactElement {
  return (
    <div data-slot="image-difference-overlay" aria-hidden="true" className="pointer-events-none absolute inset-0">
      {diff.regions.map((region) => (
        <ImageRegionMarker
          key={`${region.x}:${region.y}:${region.width}:${region.height}`}
          data-slot="image-difference-region"
          variant="difference"
          region={{
            left: toPercent(region.x, diff.width),
            top: toPercent(region.y, diff.height),
            width: toPercent(region.width, diff.width),
            height: toPercent(region.height, diff.height),
          }}
        />
      ))}
    </div>
  );
}

import type { ReactElement } from "react";
import type { IImageDiff } from "./types.js";
import { ImageRegionMarker } from "./ImageRegionMarker.js";

interface IImageDifferenceOverlayProps {
  diff: IImageDiff;
  /** Index of the currently stepped-to changed region, emphasized more strongly than the rest. */
  activeIndex?: number;
}

const REGION_PADDING_PX = 8;

function toPercent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

/** Expands a diff bounding box outward so dashed strokes stay clear of changed text glyphs at low zoom. */
function padRegion(
  region: { x: number; y: number; width: number; height: number },
  diff: { width: number; height: number },
): { x: number; y: number; width: number; height: number } {
  const left = Math.max(0, region.x - REGION_PADDING_PX);
  const top = Math.max(0, region.y - REGION_PADDING_PX);
  const right = Math.min(diff.width, region.x + region.width + REGION_PADDING_PX);
  const bottom = Math.min(diff.height, region.y + region.height + REGION_PADDING_PX);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** Outlines changed regions over the after image box; percentages keep the outlines aligned at every zoom level. */
export function ImageDifferenceOverlay({ diff, activeIndex }: IImageDifferenceOverlayProps): ReactElement {
  return (
    <div data-slot="image-difference-overlay" aria-hidden="true" className="pointer-events-none absolute inset-0">
      {diff.regions.map((region, index) => {
        const padded = padRegion(region, diff);
        return (
          <ImageRegionMarker
            key={`${region.x}:${region.y}:${region.width}:${region.height}`}
            data-slot="image-difference-region"
            variant="difference"
            active={index === activeIndex}
            region={{
              left: toPercent(padded.x, diff.width),
              top: toPercent(padded.y, diff.height),
              width: toPercent(padded.width, diff.width),
              height: toPercent(padded.height, diff.height),
            }}
          />
        );
      })}
    </div>
  );
}

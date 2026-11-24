import type { ReactElement } from "react";
import { Button } from "../Button.js";
import type { IImageDiff, IImageDiffRegion } from "./types.js";
import { ImageRegionMarker, ImageRegionMarkerBadge } from "./ImageRegionMarker.js";

interface IImageDifferenceOverlayProps {
  diff: IImageDiff;
  /** Index of the currently stepped-to changed region, emphasized more strongly than the rest. */
  activeIndex?: number;
  /** Renders a compact Comment affordance on each outlined changed region when provided. */
  onCommentRegion?: (region: IImageDiffRegion, index: number) => void;
}

function toPercent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

/** Outlines changed regions over the after image box; percentages keep the outlines aligned at every zoom level. */
export function ImageDifferenceOverlay({
  diff,
  activeIndex,
  onCommentRegion,
}: IImageDifferenceOverlayProps): ReactElement {
  const count = diff.regions.length;
  return (
    <div
      data-slot="image-difference-overlay"
      aria-hidden={onCommentRegion ? undefined : "true"}
      className="pointer-events-none absolute inset-0"
    >
      {diff.regions.map((region, index) => {
        const isNearRight = (region.x + region.width) / diff.width > 0.8;
        return (
          <ImageRegionMarker
            key={`${region.x}:${region.y}:${region.width}:${region.height}`}
            data-slot="image-difference-region"
            variant="difference"
            active={index === activeIndex}
            region={{
              left: toPercent(region.x, diff.width),
              top: toPercent(region.y, diff.height),
              width: toPercent(region.width, diff.width),
              height: toPercent(region.height, diff.height),
            }}
          >
            {onCommentRegion && (
              <ImageRegionMarkerBadge
                data-slot="image-difference-comment"
                position={isNearRight ? { left: "0", top: "calc(100% + 6px)" } : { left: "calc(100% + 6px)", top: "0" }}
              >
                <Button
                  variant="secondary"
                  size="xs"
                  aria-label={`Comment on change ${index + 1} of ${count}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onCommentRegion(region, index)}
                >
                  Comment
                </Button>
              </ImageRegionMarkerBadge>
            )}
          </ImageRegionMarker>
        );
      })}
    </div>
  );
}

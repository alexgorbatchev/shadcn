import type { ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { ToggleGroup, ToggleGroupItem } from "../ToggleGroup.js";
import type { ImageZoom } from "./types.js";

export interface IImageZoomToggleProps extends IDensityProps {
  zoom: ImageZoom;
  onZoomChange: (zoom: ImageZoom) => void;
  /** Accessible name of the control group. Defaults to "Zoom". */
  label?: string;
  size?: "sm" | "default" | "lg";
  orientation?: "horizontal" | "vertical";
  /** `fill` stretches the options across the parent width. */
  layout?: "content" | "fill";
  disabled?: boolean;
}

/**
 * Zoom selection for ImageViewer and ImageComparison. Each option is a pressed-state toggle with a constant visible
 * name, so assistive technology announces the active zoom without relabelling a single button.
 */
export function ImageZoomToggle({
  zoom,
  onZoomChange,
  label = "Zoom",
  size = "sm",
  orientation = "horizontal",
  layout = "content",
  disabled = false,
  density,
}: IImageZoomToggleProps): ReactElement {
  return (
    <ToggleGroup
      aria-label={label}
      required
      value={[zoom]}
      // The required group always reports exactly one of its two values.
      onValueChange={(value) => onZoomChange(value[0] === "original" ? "original" : "fit")}
      variant="outline"
      size={size}
      spacing={0}
      orientation={orientation}
      layout={layout}
      disabled={disabled}
      density={density}
    >
      <ToggleGroupItem value="fit">Fit to screen</ToggleGroupItem>
      <ToggleGroupItem value="original">Original size</ToggleGroupItem>
    </ToggleGroup>
  );
}

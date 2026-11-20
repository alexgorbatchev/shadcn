import { MinusIcon, PlusIcon } from "lucide-react";
import type { ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Button } from "../Button.js";
import { Toggle } from "../Toggle.js";
import { MAX_IMAGE_ZOOM, formatImageZoom, getNextImageZoom, getPreviousImageZoom } from "./imageZoom.js";
import type { IImageZoomScales, ImageZoom } from "./types.js";

export interface IImageZoomControlProps extends IDensityProps {
  zoom: ImageZoom;
  /** The scale `zoom` resolves to; undefined until the image and its viewport are measured. */
  scale: number | undefined;
  /** The fitted scales, which bound zooming out; undefined until measured. */
  scales: IImageZoomScales | undefined;
  onZoomChange: (zoom: ImageZoom) => void;
  /** Accessible name of the control group. Defaults to "Zoom". */
  label?: string;
}

/**
 * Zoom bar for ImageViewer: Fit and Fit width as pressed-state toggles, then zoom out, the current percent and zoom in.
 * Zoom in steps up to 400% and stops; zoom out steps down to Fit.
 */
export function ImageZoomControl({
  zoom,
  scale,
  scales,
  onZoomChange,
  label = "Zoom",
  density,
}: IImageZoomControlProps): ReactElement {
  const isMeasured = scale !== undefined && scales !== undefined;
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="image-zoom-control"
      data-density={density}
      className="flex shrink-0 items-center gap-control-gap"
    >
      <Toggle
        variant="outline"
        size="sm"
        density={density}
        pressed={zoom === "fit"}
        onPressedChange={() => onZoomChange("fit")}
      >
        Fit
      </Toggle>
      <Toggle
        variant="outline"
        size="sm"
        density={density}
        pressed={zoom === "fit-width"}
        onPressedChange={() => onZoomChange("fit-width")}
      >
        Fit width
      </Toggle>
      <Button
        variant="outline"
        size="icon-sm"
        density={density}
        focusableWhenDisabled
        aria-label="Zoom out"
        disabled={!isMeasured || zoom === "fit" || scale <= scales.fit + 0.001}
        onClick={() => {
          if (isMeasured) onZoomChange(getPreviousImageZoom(scale, scales));
        }}
      >
        <MinusIcon />
      </Button>
      <output
        aria-label="Zoom level"
        data-slot="image-zoom-level"
        className="min-w-12 text-center text-sm tabular-nums"
      >
        {isMeasured ? formatImageZoom(scale) : "–"}
      </output>
      <Button
        variant="outline"
        size="icon-sm"
        density={density}
        focusableWhenDisabled
        aria-label="Zoom in"
        disabled={!isMeasured || scale >= MAX_IMAGE_ZOOM - 0.001}
        onClick={() => {
          if (isMeasured) onZoomChange(getNextImageZoom(scale));
        }}
      >
        <PlusIcon />
      </Button>
    </div>
  );
}

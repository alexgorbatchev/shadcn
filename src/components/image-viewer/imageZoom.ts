import type { IImageSize, IImageZoomScales, ImageZoom } from "./types.js";

/** Largest zoom, as a scale: 4 rendered CSS pixels per natural image pixel. */
export const MAX_IMAGE_ZOOM = 4;

/** Scales that zoom in and zoom out step through, beyond the fitted scales. */
export const IMAGE_ZOOM_STEPS: readonly number[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

/** Differences below this are rounding, not a different zoom. */
const EPSILON = 0.001;

/** How much wider fit width must be than fit before an image opens at fit width. */
const TALL_RATIO = 1.25;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * The fitted scales of an image inside a viewport. `fit` shows the whole image without upscaling it; `fitWidth` fills
 * the viewport's width, upscaling narrow images up to `MAX_IMAGE_ZOOM`.
 */
export function getImageZoomScales(natural: IImageSize, viewport: IImageSize): IImageZoomScales {
  if (natural.width <= 0 || natural.height <= 0) return { fit: 1, fitWidth: 1 };
  const fit = Math.max(0, Math.min(1, viewport.width / natural.width, viewport.height / natural.height));
  const fitWidth = Math.max(0, Math.min(MAX_IMAGE_ZOOM, viewport.width / natural.width));
  return { fit, fitWidth };
}

/** Smallest scale zooming may reach: the fitted scale, or 100% for an image already smaller than the viewport. */
function getMinimumScale(scales: IImageZoomScales): number {
  return Math.min(scales.fit, MAX_IMAGE_ZOOM);
}

/** Resolves a zoom to its scale. Numeric zooms clamp between the fitted scale and `MAX_IMAGE_ZOOM`. */
export function resolveImageZoomScale(zoom: ImageZoom, scales: IImageZoomScales): number {
  if (zoom === "fit") return scales.fit;
  if (zoom === "fit-width") return scales.fitWidth;
  return clamp(zoom, getMinimumScale(scales), MAX_IMAGE_ZOOM);
}

/** Clamps a free scale, such as one from a pinch or wheel, to the zoom range. */
export function clampImageZoomScale(scale: number, scales: IImageZoomScales): number {
  return clamp(scale, getMinimumScale(scales), MAX_IMAGE_ZOOM);
}

/** The next larger zoom step after `scale`, stopping at `MAX_IMAGE_ZOOM`. */
export function getNextImageZoom(scale: number): number {
  return IMAGE_ZOOM_STEPS.find((step) => step > scale + EPSILON) ?? MAX_IMAGE_ZOOM;
}

/** The next smaller zoom step before `scale`; below the fitted scale it is `fit`. */
export function getPreviousImageZoom(scale: number, scales: IImageZoomScales): ImageZoom {
  const previous = IMAGE_ZOOM_STEPS.findLast((step) => step < scale - EPSILON);
  return previous === undefined || previous <= scales.fit + EPSILON ? "fit" : previous;
}

/**
 * The zoom an image opens at: `fit`, or `fit-width` when the image is taller than the viewport and fitting it would
 * leave more than a fifth of the width empty, so tall captures open readable and scroll vertically. It never opens narrower than `minimumWidth`, the width the image had where it was
 * opened from.
 */
export function getOpeningImageZoom(natural: IImageSize, viewport: IImageSize, minimumWidth = 0): ImageZoom {
  const scales = getImageZoomScales(natural, viewport);
  const isTall = natural.height > viewport.height && scales.fitWidth > scales.fit * TALL_RATIO;
  const zoom: ImageZoom = isTall ? "fit-width" : "fit";
  const scale = resolveImageZoomScale(zoom, scales);
  if (natural.width <= 0 || natural.width * scale >= minimumWidth - EPSILON) return zoom;
  return clamp(minimumWidth / natural.width, scale, MAX_IMAGE_ZOOM);
}

/** Formats a scale as a whole percent, such as "150%". */
export function formatImageZoom(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

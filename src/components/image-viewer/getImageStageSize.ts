import { getImageZoomScales, resolveImageZoomScale } from "./imageZoom.js";
import type { IImageSize, IImageStageSize, ImageZoom } from "./types.js";

/**
 * Sizes the rendered image box. `fit` scales the image proportionally to fit both viewport dimensions without
 * upscaling it past its natural size; `fit-width` fills the viewport's width; a number is the scale itself, clamped to
 * the zoom range.
 */
export function getImageStageSize(natural: IImageSize, viewport: IImageSize, zoom: ImageZoom): IImageStageSize {
  const width = Math.max(0, natural.width);
  const height = Math.max(0, natural.height);
  const scale = resolveImageZoomScale(zoom, getImageZoomScales({ width, height }, viewport));
  return { width: width * scale, height: height * scale, scale };
}

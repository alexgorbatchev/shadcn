import type { IImageSize, IImageStageSize, ImageZoom } from "./types.js";

/**
 * Sizes the rendered image box. `fit` scales the image proportionally to fit both viewport dimensions without
 * upscaling it past its natural size; `original` keeps the natural size in CSS pixels.
 */
export function getImageStageSize(natural: IImageSize, viewport: IImageSize, zoom: ImageZoom): IImageStageSize {
  const width = Math.max(0, natural.width);
  const height = Math.max(0, natural.height);
  const scale =
    zoom === "original" || width === 0 || height === 0
      ? 1
      : Math.max(0, Math.min(1, viewport.width / width, viewport.height / height));
  return { width: width * scale, height: height * scale, scale };
}

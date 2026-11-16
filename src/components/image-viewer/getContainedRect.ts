import type { IImageRect, IImageSize } from "./types.js";

/** Centers `source` inside `frame` at the largest scale that keeps it fully visible, like `object-fit: contain`. */
export function getContainedRect(source: IImageSize, frame: IImageSize): IImageRect {
  if (source.width <= 0 || source.height <= 0) return { x: frame.width / 2, y: frame.height / 2, width: 0, height: 0 };
  const scale = Math.min(frame.width / source.width, frame.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return { x: (frame.width - width) / 2, y: (frame.height - height) / 2, width, height };
}

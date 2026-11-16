import type { INormalizedImagePoint } from "./types.js";

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Maps viewport coordinates, such as a pointer event, to a normalized image position. Pass the bounding box of the
 * ImageViewer overlay or image, which covers the rendered image exactly at every zoom level. Points outside the box
 * clamp to its edges.
 */
export function getNormalizedImagePoint(
  point: Pick<MouseEvent, "clientX" | "clientY">,
  box: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
): INormalizedImagePoint {
  return {
    x: box.width > 0 ? clampUnit((point.clientX - box.left) / box.width) : 0,
    y: box.height > 0 ? clampUnit((point.clientY - box.top) / box.height) : 0,
  };
}

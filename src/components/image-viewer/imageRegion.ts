import type { IImageRect, INormalizedImagePoint } from "./types.js";

/** How far one arrow press moves or resizes a placed region, as a fraction of the image. */
export const IMAGE_REGION_STEP = 0.05;
/** The smallest width or height a placed region keeps, as a fraction of the image. */
export const MIN_IMAGE_REGION_SIZE = 0.01;
/** A placed region's default size: half the image's width and height. */
const DEFAULT_SIZE = 0.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rounds away floating-point noise so 0.25 + 0.05 reads as 0.3. */
function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

/** Keeps a region inside the image and at least the minimum size. */
export function clampImageRegion(region: IImageRect): IImageRect {
  const width = clamp(region.width, MIN_IMAGE_REGION_SIZE, 1);
  const height = clamp(region.height, MIN_IMAGE_REGION_SIZE, 1);
  return {
    x: round(clamp(region.x, 0, 1 - width)),
    y: round(clamp(region.y, 0, 1 - height)),
    width: round(width),
    height: round(height),
  };
}

/**
 * Places a region half the image's width and height, centred on `center` and kept inside the image. Without a center
 * it sits in the image's middle, as Enter places it on a focused stage.
 */
export function placeImageRegion(center: INormalizedImagePoint = { x: 0.5, y: 0.5 }): IImageRect {
  return clampImageRegion({
    x: center.x - DEFAULT_SIZE / 2,
    y: center.y - DEFAULT_SIZE / 2,
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
  });
}

/** The region whose opposite corners are two clicked points. */
export function getImageRegionFromCorners(first: INormalizedImagePoint, second: INormalizedImagePoint): IImageRect {
  return clampImageRegion({
    x: Math.min(first.x, second.x),
    y: Math.min(first.y, second.y),
    width: Math.abs(second.x - first.x),
    height: Math.abs(second.y - first.y),
  });
}

/**
 * Applies an arrow key to a placed region: an arrow moves it by one step and Shift with an arrow resizes it, growing
 * to the right and down and shrinking from there. Returns undefined for any other key, so the stage keeps panning.
 */
export function applyImageRegionKey(
  region: IImageRect,
  key: string,
  isResize: boolean,
  step: number = IMAGE_REGION_STEP,
): IImageRect | undefined {
  const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[key];
  if (!delta) return undefined;
  const [dx = 0, dy = 0] = delta;
  if (isResize) return clampImageRegion({ ...region, width: region.width + dx, height: region.height + dy });
  return clampImageRegion({ ...region, x: region.x + dx, y: region.y + dy });
}

function percent(value: number): string {
  return `${round(value * 100)}%`;
}

/** A region's text form, which is also its accessible name: "Region 60% × 50% at 25%, 25%". */
export function formatImageRegion(region: IImageRect): string {
  return `Region ${percent(region.width)} × ${percent(region.height)} at ${percent(region.x)}, ${percent(region.y)}`;
}

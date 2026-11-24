import type { StackDirection } from "../../layout/types.js";

/**
 * `fit` scales the image down to show all of it; `fit-width` fills the viewport's width and scrolls vertically; a
 * number is a scale in rendered CSS pixels per natural image pixel, from the fitted scale up to 4 (400%), so `1` shows
 * the image at its natural size.
 */
export type ImageZoom = "fit" | "fit-width" | number;

/** Scales of the two fitted zooms of an image in a viewport. */
export interface IImageZoomScales {
  /** Shows the whole image, never upscaled past its natural size. */
  fit: number;
  /** Fills the viewport's width, upscaled up to 4. */
  fitWidth: number;
}

/** How ImageComparison presents the before and after images. */
export type ImageComparisonMode = "toggle" | "swipe" | "side-by-side";

/** The image a comparison shows in `toggle` mode. */
export type ImageComparisonSide = "before" | "after";

/** Side-by-side pane arrangement: `horizontal` places panes left and right, `vertical` top and bottom. */
export type ImageComparisonOrientation = StackDirection;

export interface IImageSize {
  width: number;
  height: number;
}

export interface IImageRect extends IImageSize {
  x: number;
  y: number;
}

/** A position inside an image, from 0 (left or top edge) to 1 (right or bottom edge). */
export interface INormalizedImagePoint {
  x: number;
  y: number;
}

export interface IImageStageSize extends IImageSize {
  /** Rendered CSS pixels per natural image pixel. */
  scale: number;
}

export interface IImageComparisonSource {
  src: string;
  alt: string;
  /** CORS mode for the image request. Cross-origin pixels can only be compared when the server allows CORS. */
  crossOrigin?: "anonymous" | "use-credentials";
}

/** RGBA pixels in row-major order, such as an `ImageData`. */
export interface IImagePixels {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

export interface IImageDiffOptions {
  /** Largest per-channel difference, from 0 to 255, still treated as unchanged. Defaults to 32. */
  threshold?: number;
  /** Side length in pixels of the square cells that changed pixels are aggregated into. Defaults to 16. */
  cellSize?: number;
  /** Changed pixels a cell needs before it counts as changed, which filters isolated noise. Defaults to 2. */
  minChangedPixels?: number;
}

/** A connected group of changed cells, bounded tightly around its changed pixels in image pixel coordinates. */
export interface IImageDiffRegion extends IImageRect {
  changedPixels: number;
}

export interface IImageDiff {
  width: number;
  height: number;
  cellSize: number;
  columns: number;
  rows: number;
  /** One entry per cell in row-major order: 1 when the cell changed, otherwise 0. */
  cells: Uint8Array;
  /** Changed regions ordered from top to bottom, then left to right. */
  regions: IImageDiffRegion[];
  /** Changed pixels inside changed cells. */
  changedPixels: number;
}

export interface IImageDiffAccumulator {
  /**
   * Compares `rowCount` image rows starting at row `startY`. Both buffers hold RGBA rows that span the full image
   * width, starting with row `startY`.
   */
  addRows(before: ArrayLike<number>, after: ArrayLike<number>, startY: number, rowCount: number): void;
  finish(): IImageDiff;
}

export interface IImageLoadState {
  status: "loading" | "loaded" | "error";
  /** Natural size once the image has loaded. */
  size?: IImageSize;
}

/** Pixel comparison progress; `reason` explains why pixels could not be read. */
export type ImageDifferenceState =
  | { status: "idle" | "measuring" }
  | { status: "ready"; diff: IImageDiff }
  | { status: "unavailable"; reason: string };

import { createImageDiffAccumulator } from "./computeImageDiff.js";
import { getContainedRect } from "./getContainedRect.js";
import type { IImageDiff, IImageDiffOptions } from "./types.js";

const DEFAULT_SLICE_BUDGET = 8;
const BAND_HEIGHT = 32;

export interface IMeasureImageDifferencesOptions extends IImageDiffOptions {
  signal?: AbortSignal;
  /** Milliseconds of comparison work per task before yielding to the browser. */
  sliceBudget?: number;
  /** Resolves when the browser may handle input and rendering. */
  yieldToMain?: () => Promise<void>;
  now?: () => number;
}

function yieldToMain(): Promise<void> {
  if (typeof scheduler !== "undefined" && typeof scheduler.yield === "function") return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createReadableContext(image: HTMLImageElement, width: number, height: number): CanvasRenderingContext2D {
  const canvas = image.ownerDocument.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  // Software-backed canvases keep repeated getImageData calls from forcing GPU readbacks.
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D drawing is unavailable.");
  return context;
}

function isDOMException(error: unknown, name: string): boolean {
  return error instanceof DOMException && error.name === name;
}

/** Explains why image pixels could not be read, or returns undefined for cancellation. */
export function describeImageReadError(error: unknown): string | undefined {
  if (isDOMException(error, "AbortError")) return undefined;
  if (isDOMException(error, "SecurityError")) {
    return "Pixels cannot be read: an image comes from another origin without CORS access.";
  }
  if (isDOMException(error, "EncodingError")) return "Pixels cannot be read: an image could not be decoded.";
  return "Pixels cannot be read in this browser.";
}

/** Checks with a one-pixel draw whether the image's pixels are readable, resolving the reason when they are not. */
export async function getImageReadFailure(image: HTMLImageElement): Promise<string | undefined> {
  try {
    await image.decode();
    const context = createReadableContext(image, 1, 1);
    context.drawImage(image, 0, 0, 1, 1);
    context.getImageData(0, 0, 1, 1);
    return undefined;
  } catch (error) {
    return describeImageReadError(error);
  }
}

/**
 * Compares two loaded images at the after image's natural size, drawing the before image inside that box with
 * `contain` scaling. Pixel rows are read and compared in slices that yield between tasks, so large screenshots do not
 * block input or rendering.
 */
export async function measureImageDifferences(
  before: HTMLImageElement,
  after: HTMLImageElement,
  {
    signal,
    sliceBudget = DEFAULT_SLICE_BUDGET,
    yieldToMain: yieldTask = yieldToMain,
    now = () => performance.now(),
    ...options
  }: IMeasureImageDifferencesOptions = {},
): Promise<IImageDiff> {
  // Decoding asynchronously keeps drawImage from decoding large images on the main thread.
  await Promise.all([before.decode(), after.decode()]);
  signal?.throwIfAborted();
  const width = after.naturalWidth;
  const height = after.naturalHeight;
  const beforeContext = createReadableContext(after, width, height);
  const afterContext = createReadableContext(after, width, height);
  const placement = getContainedRect({ width: before.naturalWidth, height: before.naturalHeight }, { width, height });
  beforeContext.drawImage(before, placement.x, placement.y, placement.width, placement.height);
  await yieldTask();
  signal?.throwIfAborted();
  afterContext.drawImage(after, 0, 0, width, height);
  await yieldTask();
  signal?.throwIfAborted();
  const accumulator = createImageDiffAccumulator(width, height, options);
  let sliceStart = now();
  for (let y = 0; y < height; y += BAND_HEIGHT) {
    const rowCount = Math.min(BAND_HEIGHT, height - y);
    accumulator.addRows(
      beforeContext.getImageData(0, y, width, rowCount).data,
      afterContext.getImageData(0, y, width, rowCount).data,
      y,
      rowCount,
    );
    if (now() - sliceStart >= sliceBudget) {
      await yieldTask();
      signal?.throwIfAborted();
      sliceStart = now();
    }
  }
  return accumulator.finish();
}

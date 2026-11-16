import type { IImagePixels, IImageRect } from "../types";

export type Rgba = readonly [number, number, number, number];

export interface IPixelPaint {
  rect: IImageRect;
  color: Rgba;
}

/** Builds RGBA pixels filled with `color`, then paints each rectangle in order. */
export function createPixels(width: number, height: number, color: Rgba, paints: IPixelPaint[] = []): IImagePixels {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4) data.set(color, offset);
  for (const paint of paints) {
    for (let y = paint.rect.y; y < paint.rect.y + paint.rect.height; y++) {
      for (let x = paint.rect.x; x < paint.rect.x + paint.rect.width; x++) data.set(paint.color, (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

/** Returns `rowCount` full-width RGBA rows starting at row `startY`. */
export function sliceRows(pixels: IImagePixels, startY: number, rowCount: number): Uint8ClampedArray {
  return Uint8ClampedArray.from(pixels.data).subarray(
    startY * pixels.width * 4,
    (startY + rowCount) * pixels.width * 4,
  );
}

/** Lists the indexes of changed cells in row-major order. */
export function getChangedCells(cells: Uint8Array): number[] {
  return [...cells.keys()].filter((index) => cells[index] === 1);
}

function toSvgColor(color: Rgba): string {
  return `rgb(${color[0]} ${color[1]} ${color[2]} / ${color[3] / 255})`;
}

/** Builds an SVG data URL whose axis-aligned rectangles rasterize without antialiasing. */
export function createSvgImageUrl(width: number, height: number, background: Rgba, paints: IPixelPaint[] = []): string {
  const shapes = paints
    .map(
      ({ rect, color }) =>
        `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${toSvgColor(color)}"/>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${toSvgColor(background)}"/>${shapes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Loads and decodes an image element. */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

/** Runs `work` while recording the durations of browser long tasks (main-thread tasks over 50 ms). */
export async function recordLongTasks<T>(work: () => Promise<T>): Promise<readonly [T, number[]]> {
  const durations: number[] = [];
  const observer = new PerformanceObserver((list) => {
    durations.push(...list.getEntries().map((entry) => entry.duration));
  });
  observer.observe({ type: "longtask" });
  try {
    const result = await work();
    await new Promise(requestAnimationFrame);
    durations.push(...observer.takeRecords().map((entry) => entry.duration));
    return [result, durations];
  } finally {
    observer.disconnect();
  }
}

/**
 * Loads a file served by the test server through a different loopback host name, which makes it a cross-origin image
 * fetched without CORS. Servers bind IPv4 or IPv6 loopback depending on the host, so each alternative is tried.
 */
export async function loadCrossOriginImage(path: string): Promise<HTMLImageElement> {
  const failures: unknown[] = [];
  for (const hostname of ["localhost", "127.0.0.1", "[::1]"].filter((host) => host !== location.hostname)) {
    const url = new URL(path, location.href);
    url.hostname = hostname;
    try {
      return await loadImage(url.href);
    } catch (error) {
      failures.push(error);
    }
  }
  throw new AggregateError(failures, `No alternative loopback host served ${path}.`);
}

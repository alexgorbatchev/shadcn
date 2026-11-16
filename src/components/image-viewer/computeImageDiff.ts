import type { IImageDiff, IImageDiffAccumulator, IImageDiffOptions, IImageDiffRegion, IImagePixels } from "./types.js";

const DEFAULT_THRESHOLD = 32;
const DEFAULT_CELL_SIZE = 16;
const DEFAULT_MIN_CHANGED_PIXELS = 2;

function getPixelDelta(before: ArrayLike<number>, after: ArrayLike<number>, offset: number): number {
  const beforeAlpha = before[offset + 3];
  const afterAlpha = after[offset + 3];
  // Premultiply so fully transparent pixels compare equal whatever color channels they carry.
  return Math.max(
    Math.abs(beforeAlpha - afterAlpha),
    Math.abs(before[offset] * beforeAlpha - after[offset] * afterAlpha) / 255,
    Math.abs(before[offset + 1] * beforeAlpha - after[offset + 1] * afterAlpha) / 255,
    Math.abs(before[offset + 2] * beforeAlpha - after[offset + 2] * afterAlpha) / 255,
  );
}

function collectRegions(
  cells: Uint8Array,
  counts: Uint32Array,
  bounds: Int32Array,
  columns: number,
  rows: number,
): IImageDiffRegion[] {
  const visited = new Uint8Array(cells.length);
  const regions: IImageDiffRegion[] = [];
  const stack: number[] = [];
  for (let start = 0; start < cells.length; start++) {
    if (!cells[start] || visited[start]) continue;
    visited[start] = 1;
    stack.push(start);
    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;
    let changedPixels = 0;
    for (let cell = stack.pop(); cell !== undefined; cell = stack.pop()) {
      left = Math.min(left, bounds[cell * 4]);
      top = Math.min(top, bounds[cell * 4 + 1]);
      right = Math.max(right, bounds[cell * 4 + 2]);
      bottom = Math.max(bottom, bounds[cell * 4 + 3]);
      changedPixels += counts[cell];
      const column = cell % columns;
      const row = (cell - column) / columns;
      for (let neighborRow = Math.max(0, row - 1); neighborRow <= Math.min(rows - 1, row + 1); neighborRow++) {
        for (
          let neighborColumn = Math.max(0, column - 1);
          neighborColumn <= Math.min(columns - 1, column + 1);
          neighborColumn++
        ) {
          const neighbor = neighborRow * columns + neighborColumn;
          if (cells[neighbor] && !visited[neighbor]) {
            visited[neighbor] = 1;
            stack.push(neighbor);
          }
        }
      }
    }
    regions.push({ x: left, y: top, width: right - left + 1, height: bottom - top + 1, changedPixels });
  }
  return regions.sort((first, second) => first.y - second.y || first.x - second.x);
}

/**
 * Creates an incremental pixel comparison for images of the given size, so callers can feed rows in slices and yield
 * between them. Every row must be added exactly once before `finish`.
 */
export function createImageDiffAccumulator(
  width: number,
  height: number,
  {
    threshold = DEFAULT_THRESHOLD,
    cellSize = DEFAULT_CELL_SIZE,
    minChangedPixels = DEFAULT_MIN_CHANGED_PIXELS,
  }: IImageDiffOptions = {},
): IImageDiffAccumulator {
  const size = Math.max(1, Math.floor(cellSize));
  const columns = Math.ceil(width / size);
  const rows = Math.ceil(height / size);
  const counts = new Uint32Array(columns * rows);
  // Tight changed-pixel bounds per cell: left, top, right, bottom.
  const bounds = new Int32Array(columns * rows * 4);
  for (let cell = 0; cell < counts.length; cell++) {
    bounds[cell * 4] = width;
    bounds[cell * 4 + 1] = height;
    bounds[cell * 4 + 2] = -1;
    bounds[cell * 4 + 3] = -1;
  }
  return {
    addRows(before, after, startY, rowCount) {
      for (let row = 0; row < rowCount; row++) {
        const y = startY + row;
        const cellRowStart = Math.floor(y / size) * columns;
        let offset = row * width * 4;
        for (let x = 0; x < width; x++, offset += 4) {
          if (getPixelDelta(before, after, offset) <= threshold) continue;
          const cell = cellRowStart + Math.floor(x / size);
          counts[cell]++;
          const boundsOffset = cell * 4;
          if (x < bounds[boundsOffset]) bounds[boundsOffset] = x;
          if (y < bounds[boundsOffset + 1]) bounds[boundsOffset + 1] = y;
          if (x > bounds[boundsOffset + 2]) bounds[boundsOffset + 2] = x;
          if (y > bounds[boundsOffset + 3]) bounds[boundsOffset + 3] = y;
        }
      }
    },
    finish() {
      const cells = new Uint8Array(counts.length);
      for (let cell = 0; cell < counts.length; cell++) {
        if (counts[cell] >= Math.max(1, minChangedPixels)) cells[cell] = 1;
      }
      const regions = collectRegions(cells, counts, bounds, columns, rows);
      const changedPixels = regions.reduce((total, region) => total + region.changedPixels, 0);
      return { width, height, cellSize: size, columns, rows, cells, regions, changedPixels };
    },
  };
}

/**
 * Compares two equally sized RGBA images pixel by pixel. A pixel changes when any premultiplied channel differs by more
 * than the threshold; changed pixels are aggregated into cells, and touching cells (including diagonally) form regions.
 */
export function computeImageDiff(before: IImagePixels, after: IImagePixels, options?: IImageDiffOptions): IImageDiff {
  if (before.width !== after.width || before.height !== after.height) {
    throw new RangeError(
      `Cannot compare ${before.width}×${before.height} pixels with ${after.width}×${after.height} pixels.`,
    );
  }
  const length = before.width * before.height * 4;
  if (before.data.length < length || after.data.length < length) {
    throw new RangeError(`Expected ${length} RGBA values for a ${before.width}×${before.height} image.`);
  }
  const accumulator = createImageDiffAccumulator(after.width, after.height, options);
  accumulator.addRows(before.data, after.data, 0, after.height);
  return accumulator.finish();
}

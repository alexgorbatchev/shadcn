import { expect, test } from "vitest";
import { computeImageDiff, createImageDiffAccumulator } from "../computeImageDiff";
import { createPixels, getChangedCells, sliceRows, type Rgba } from "./helpers";

const WHITE: Rgba = [255, 255, 255, 255];
const BLACK: Rgba = [0, 0, 0, 255];
const RED: Rgba = [220, 38, 38, 255];

test("identical images have no changed cells or regions", () => {
  const diff = computeImageDiff(createPixels(64, 48, WHITE), createPixels(64, 48, WHITE));
  expect(diff).toEqual({
    width: 64,
    height: 48,
    cellSize: 16,
    columns: 4,
    rows: 3,
    cells: new Uint8Array(12),
    regions: [],
    changedPixels: 0,
  });
});

test("a changed rectangle forms one region bounded tightly in image pixels", () => {
  const before = createPixels(96, 64, WHITE);
  const after = createPixels(96, 64, WHITE, [{ rect: { x: 21, y: 9, width: 30, height: 20 }, color: RED }]);
  const diff = computeImageDiff(before, after);
  expect(diff.regions).toEqual([{ x: 21, y: 9, width: 30, height: 20, changedPixels: 600 }]);
  expect(diff.changedPixels).toBe(600);
  expect(getChangedCells(diff.cells)).toEqual([1, 2, 3, 7, 8, 9]);
});

test("channel deltas up to the threshold count as unchanged", () => {
  const before = createPixels(16, 16, [100, 100, 100, 255]);
  expect(computeImageDiff(before, createPixels(16, 16, [132, 100, 100, 255])).regions).toEqual([]);
  expect(computeImageDiff(before, createPixels(16, 16, [100, 100, 133, 255])).regions).toEqual([
    { x: 0, y: 0, width: 16, height: 16, changedPixels: 256 },
  ]);
  expect(computeImageDiff(before, createPixels(16, 16, [100, 106, 100, 255]), { threshold: 5 }).changedPixels).toBe(
    256,
  );
});

test("premultiplied comparison ignores the color of fully transparent pixels but not alpha changes", () => {
  const transparentRed = createPixels(16, 16, [255, 0, 0, 0]);
  expect(computeImageDiff(transparentRed, createPixels(16, 16, [0, 0, 255, 0])).regions).toEqual([]);
  expect(computeImageDiff(transparentRed, createPixels(16, 16, [255, 0, 0, 255])).changedPixels).toBe(256);
  expect(
    computeImageDiff(createPixels(16, 16, [0, 0, 0, 200]), createPixels(16, 16, [0, 0, 0, 255])).changedPixels,
  ).toBe(256);
});

test("cells with fewer changed pixels than the minimum are treated as noise", () => {
  const before = createPixels(32, 32, WHITE);
  const after = createPixels(32, 32, WHITE, [{ rect: { x: 5, y: 7, width: 1, height: 1 }, color: BLACK }]);
  expect(computeImageDiff(before, after).regions).toEqual([]);
  expect(computeImageDiff(before, after, { minChangedPixels: 1 }).regions).toEqual([
    { x: 5, y: 7, width: 1, height: 1, changedPixels: 1 },
  ]);
  expect(computeImageDiff(before, after, { minChangedPixels: 0 }).regions).toHaveLength(1);
});

test("diagonally touching cells merge and separate regions are ordered by top, then left", () => {
  const before = createPixels(64, 64, WHITE);
  const after = createPixels(64, 64, WHITE, [
    { rect: { x: 50, y: 2, width: 4, height: 4 }, color: BLACK },
    { rect: { x: 2, y: 2, width: 4, height: 4 }, color: BLACK },
    { rect: { x: 18, y: 18, width: 4, height: 4 }, color: BLACK },
    { rect: { x: 4, y: 52, width: 4, height: 4 }, color: BLACK },
  ]);
  const diff = computeImageDiff(before, after);
  expect(diff.regions).toEqual([
    { x: 2, y: 2, width: 20, height: 20, changedPixels: 32 },
    { x: 50, y: 2, width: 4, height: 4, changedPixels: 16 },
    { x: 4, y: 52, width: 4, height: 4, changedPixels: 16 },
  ]);
  expect(diff.changedPixels).toBe(64);
});

test("partial edge cells aggregate images whose size is not a cell multiple", () => {
  const before = createPixels(20, 10, WHITE);
  const after = createPixels(20, 10, WHITE, [{ rect: { x: 17, y: 8, width: 3, height: 2 }, color: BLACK }]);
  const diff = computeImageDiff(before, after, { cellSize: 8 });
  expect(diff).toMatchObject({ cellSize: 8, columns: 3, rows: 2 });
  expect(getChangedCells(diff.cells)).toEqual([5]);
  expect(diff.regions).toEqual([{ x: 17, y: 8, width: 3, height: 2, changedPixels: 6 }]);
});

test("cell sizes are normalized to whole pixels of at least one", () => {
  expect(computeImageDiff(createPixels(10, 10, WHITE), createPixels(10, 10, WHITE), { cellSize: 4.7 })).toMatchObject({
    cellSize: 4,
    columns: 3,
    rows: 3,
  });
  expect(computeImageDiff(createPixels(3, 2, WHITE), createPixels(3, 2, WHITE), { cellSize: 0 })).toMatchObject({
    cellSize: 1,
    columns: 3,
    rows: 2,
  });
});

test("empty images produce an empty grid", () => {
  expect(computeImageDiff(createPixels(0, 0, WHITE), createPixels(0, 0, WHITE))).toEqual({
    width: 0,
    height: 0,
    cellSize: 16,
    columns: 0,
    rows: 0,
    cells: new Uint8Array(0),
    regions: [],
    changedPixels: 0,
  });
});

test("pixel buffers must share dimensions and hold every RGBA value", () => {
  expect(() => computeImageDiff(createPixels(2, 2, WHITE), createPixels(2, 3, WHITE))).toThrow(
    new RangeError("Cannot compare 2×2 pixels with 2×3 pixels."),
  );
  expect(() =>
    computeImageDiff({ width: 2, height: 2, data: new Uint8ClampedArray(15) }, createPixels(2, 2, WHITE)),
  ).toThrow(new RangeError("Expected 16 RGBA values for a 2×2 image."));
  expect(() =>
    computeImageDiff(createPixels(2, 2, WHITE), { width: 2, height: 2, data: new Uint8ClampedArray(12) }),
  ).toThrow(new RangeError("Expected 16 RGBA values for a 2×2 image."));
});

test.each([1, 5, 16, 37])("accumulating rows in bands of %i matches a full comparison", (bandHeight) => {
  const before = createPixels(40, 37, WHITE, [{ rect: { x: 3, y: 30, width: 9, height: 7 }, color: BLACK }]);
  const after = createPixels(40, 37, WHITE, [
    { rect: { x: 30, y: 2, width: 6, height: 20 }, color: RED },
    { rect: { x: 3, y: 30, width: 9, height: 7 }, color: RED },
  ]);
  const accumulator = createImageDiffAccumulator(40, 37, { cellSize: 8 });
  for (let y = 0; y < 37; y += bandHeight) {
    const rowCount = Math.min(bandHeight, 37 - y);
    accumulator.addRows(sliceRows(before, y, rowCount), sliceRows(after, y, rowCount), y, rowCount);
  }
  expect(accumulator.finish()).toEqual(computeImageDiff(before, after, { cellSize: 8 }));
});

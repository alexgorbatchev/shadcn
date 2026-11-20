import { expect, test } from "vitest";
import {
  applyImageRegionKey,
  clampImageRegion,
  formatImageRegion,
  getImageRegionFromCorners,
  placeImageRegion,
} from "../imageRegion";

test("Enter's region is half the image in its middle, named by its text form", () => {
  const region = placeImageRegion();
  expect(region).toEqual({ x: 0.25, y: 0.25, width: 0.5, height: 0.5 });
  expect(formatImageRegion(region)).toBe("Region 50% × 50% at 25%, 25%");
});

test("a click places the half-size region centred on it, kept inside the image", () => {
  expect(placeImageRegion({ x: 0.5, y: 0.4 })).toEqual({ x: 0.25, y: 0.15, width: 0.5, height: 0.5 });
  expect(placeImageRegion({ x: 0.95, y: 0.05 })).toEqual({ x: 0.5, y: 0, width: 0.5, height: 0.5 });
});

test("two clicks become the region's opposite corners in either order", () => {
  expect(getImageRegionFromCorners({ x: 0.6, y: 0.7 }, { x: 0.2, y: 0.1 })).toEqual({
    x: 0.2,
    y: 0.1,
    width: 0.4,
    height: 0.6,
  });
  // Two clicks on one spot still leave a visible region.
  expect(getImageRegionFromCorners({ x: 0.3, y: 0.3 }, { x: 0.3, y: 0.3 })).toEqual({
    x: 0.3,
    y: 0.3,
    width: 0.01,
    height: 0.01,
  });
});

test("arrows move a placed region by 5% and Shift+arrows resize it, inside the image", () => {
  const placed = placeImageRegion();
  const wider = applyImageRegionKey(applyImageRegionKey(placed, "ArrowRight", true) ?? placed, "ArrowRight", true);
  expect(wider && formatImageRegion(wider)).toBe("Region 60% × 50% at 25%, 25%");
  expect(applyImageRegionKey(placed, "ArrowRight", false)).toEqual({ x: 0.3, y: 0.25, width: 0.5, height: 0.5 });
  expect(applyImageRegionKey(placed, "ArrowLeft", false)).toEqual({ x: 0.2, y: 0.25, width: 0.5, height: 0.5 });
  expect(applyImageRegionKey(placed, "ArrowUp", false)).toEqual({ x: 0.25, y: 0.2, width: 0.5, height: 0.5 });
  expect(applyImageRegionKey(placed, "ArrowDown", true)).toEqual({ x: 0.25, y: 0.25, width: 0.5, height: 0.55 });
  expect(applyImageRegionKey({ x: 0.5, y: 0, width: 0.5, height: 0.5 }, "ArrowRight", false)?.x).toBe(0.5);
  expect(applyImageRegionKey(placed, "Enter", false)).toBeUndefined();
});

test("clamping keeps regions inside the image and at least 1% in size", () => {
  expect(clampImageRegion({ x: -0.2, y: 0.995, width: 2, height: 0 })).toEqual({
    x: 0,
    y: 0.99,
    width: 1,
    height: 0.01,
  });
});

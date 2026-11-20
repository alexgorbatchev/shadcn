import { expect, test } from "vitest";
import { getImageStageSize } from "../getImageStageSize";

test("fit scales a large image proportionally to the tighter viewport dimension", () => {
  expect(getImageStageSize({ width: 1600, height: 1000 }, { width: 800, height: 600 }, "fit")).toEqual({
    width: 800,
    height: 500,
    scale: 0.5,
  });
  expect(getImageStageSize({ width: 1000, height: 2000 }, { width: 800, height: 500 }, "fit")).toEqual({
    width: 250,
    height: 500,
    scale: 0.25,
  });
});

test("fit never upscales an image smaller than the viewport", () => {
  expect(getImageStageSize({ width: 240, height: 150 }, { width: 800, height: 600 }, "fit")).toEqual({
    width: 240,
    height: 150,
    scale: 1,
  });
});

test("a numeric zoom is the scale itself, clamped between the fitted scale and 400%", () => {
  expect(getImageStageSize({ width: 400, height: 250 }, { width: 800, height: 600 }, 2)).toEqual({
    width: 800,
    height: 500,
    scale: 2,
  });
  expect(getImageStageSize({ width: 400, height: 250 }, { width: 800, height: 600 }, 9).scale).toBe(4);
  expect(getImageStageSize({ width: 1600, height: 1000 }, { width: 800, height: 600 }, 0.1).scale).toBe(0.5);
});

test("100% keeps the natural size whatever the viewport", () => {
  expect(getImageStageSize({ width: 1600, height: 1000 }, { width: 200, height: 100 }, 1)).toEqual({
    width: 1600,
    height: 1000,
    scale: 1,
  });
});

test("degenerate sizes collapse to an empty box instead of producing invalid geometry", () => {
  expect(getImageStageSize({ width: 0, height: 100 }, { width: 800, height: 600 }, "fit")).toEqual({
    width: 0,
    height: 100,
    scale: 1,
  });
  expect(getImageStageSize({ width: -10, height: 0 }, { width: 800, height: 600 }, "fit")).toEqual({
    width: 0,
    height: 0,
    scale: 1,
  });
  expect(getImageStageSize({ width: 400, height: 300 }, { width: 0, height: 0 }, "fit")).toEqual({
    width: 0,
    height: 0,
    scale: 0,
  });
  expect(getImageStageSize({ width: 400, height: 300 }, { width: -50, height: 300 }, "fit")).toEqual({
    width: 0,
    height: 0,
    scale: 0,
  });
});

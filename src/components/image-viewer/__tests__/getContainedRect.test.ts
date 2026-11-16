import { expect, test } from "vitest";
import { getContainedRect } from "../getContainedRect";

test("a wider source is letterboxed above and below", () => {
  expect(getContainedRect({ width: 960, height: 540 }, { width: 960, height: 600 })).toEqual({
    x: 0,
    y: 30,
    width: 960,
    height: 540,
  });
});

test("a taller source is pillarboxed and scaled down to the frame height", () => {
  expect(getContainedRect({ width: 300, height: 1200 }, { width: 800, height: 600 })).toEqual({
    x: 325,
    y: 0,
    width: 150,
    height: 600,
  });
});

test("a smaller source with the same aspect ratio scales up to fill the frame", () => {
  expect(getContainedRect({ width: 480, height: 300 }, { width: 960, height: 600 })).toEqual({
    x: 0,
    y: 0,
    width: 960,
    height: 600,
  });
});

test("an empty source collapses to the frame center", () => {
  expect(getContainedRect({ width: 0, height: 300 }, { width: 960, height: 600 })).toEqual({
    x: 480,
    y: 300,
    width: 0,
    height: 0,
  });
  expect(getContainedRect({ width: 300, height: 0 }, { width: 960, height: 600 })).toEqual({
    x: 480,
    y: 300,
    width: 0,
    height: 0,
  });
});

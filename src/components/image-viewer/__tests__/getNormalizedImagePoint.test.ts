import { expect, test } from "vitest";
import { getNormalizedImagePoint } from "../getNormalizedImagePoint";

const box = { left: 100, top: 50, width: 400, height: 200 };

test("viewport coordinates map to fractions of the rendered image box", () => {
  expect(getNormalizedImagePoint({ clientX: 100, clientY: 50 }, box)).toEqual({ x: 0, y: 0 });
  expect(getNormalizedImagePoint({ clientX: 300, clientY: 100 }, box)).toEqual({ x: 0.5, y: 0.25 });
  expect(getNormalizedImagePoint({ clientX: 500, clientY: 250 }, box)).toEqual({ x: 1, y: 1 });
});

test("the same image position normalizes identically at any zoom", () => {
  const fitted = { left: 20, top: 40, width: 480, height: 300 };
  const original = { left: -600, top: -310, width: 1600, height: 1000 };
  expect(getNormalizedImagePoint({ clientX: 20 + 480 * 0.45, clientY: 40 + 300 * 0.48 }, fitted)).toEqual(
    getNormalizedImagePoint({ clientX: -600 + 1600 * 0.45, clientY: -310 + 1000 * 0.48 }, original),
  );
});

test("points outside the box clamp to its edges", () => {
  expect(getNormalizedImagePoint({ clientX: 40, clientY: 400 }, box)).toEqual({ x: 0, y: 1 });
  expect(getNormalizedImagePoint({ clientX: 900, clientY: -10 }, box)).toEqual({ x: 1, y: 0 });
});

test("an empty box normalizes to its origin", () => {
  expect(getNormalizedImagePoint({ clientX: 140, clientY: 70 }, { left: 100, top: 50, width: 0, height: 0 })).toEqual({
    x: 0,
    y: 0,
  });
});

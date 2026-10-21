import { describe, expect, test } from "vitest";
import { isCoordinate } from "../geoMap.js";
describe("map coordinate validation", () => {
  test("accepts real points and inclusive geographic bounds", () => {
    expect(isCoordinate(51.5, -0.12)).toBe(true);
    expect(isCoordinate(-90, -180)).toBe(true);
    expect(isCoordinate(90, 180)).toBe(true);
  });
  test("rejects nonfinite and out of range points before Leaflet receives them", () => {
    expect(isCoordinate(Number.NaN, 0)).toBe(false);
    expect(isCoordinate(0, Number.POSITIVE_INFINITY)).toBe(false);
    expect(isCoordinate(90.1, 0)).toBe(false);
    expect(isCoordinate(0, -180.1)).toBe(false);
  });
});

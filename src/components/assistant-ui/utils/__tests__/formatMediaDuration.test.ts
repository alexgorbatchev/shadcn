import { describe, expect, test } from "vitest";
import { formatMediaDuration } from "../formatMediaDuration.js";
describe("formatMediaDuration", () => {
  test("formats whole minutes and remaining seconds", () => {
    expect(formatMediaDuration(125.9)).toBe("2:05");
  });
  test("keeps zero seconds padded", () => {
    expect(formatMediaDuration(60)).toBe("1:00");
  });
  test("normalizes negative durations", () => {
    expect(formatMediaDuration(-2)).toBe("0:00");
  });
  test("normalizes nonfinite durations", () => {
    expect(formatMediaDuration(Number.NaN)).toBe("0:00");
  });
});

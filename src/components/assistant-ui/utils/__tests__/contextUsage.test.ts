import { describe, expect, test } from "vitest";
import { getContextSegments, getUsagePercent } from "../contextUsage.js";

describe("context usage", () => {
  test("bounds measured utilization to the available context window", () => {
    expect(getUsagePercent(7500, 10000)).toBe(75);
    expect(getUsagePercent(15000, 10000)).toBe(100);
    expect(getUsagePercent(-10, 10000)).toBe(0);
    expect(getUsagePercent(100, 0)).toBe(0);
    expect(getUsagePercent(100, -100)).toBe(0);
    expect(getUsagePercent(Number.NaN, 100)).toBe(0);
    expect(getUsagePercent(100, Number.NaN)).toBe(0);
    expect(getUsagePercent(undefined, 100)).toBe(0);
  });
  test("reports provider counts independently without double-counting cached tokens", () => {
    expect(
      getContextSegments({ totalTokens: 7500, inputTokens: 6000, cachedInputTokens: 4000, outputTokens: 1500 }),
    ).toEqual([
      { label: "Input", tokens: 6000 },
      { label: "Cached input", tokens: 4000 },
      { label: "Output", tokens: 1500 },
    ]);
    expect(getContextSegments(undefined)).toEqual([]);
  });
});

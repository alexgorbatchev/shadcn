import { describe, expect, test } from "vitest";
import { formatJobElapsed } from "../formatJobElapsed.js";
describe("job elapsed duration", () => {
  test("formats seconds and mixed minute duration as native time values", () => {
    expect(formatJobElapsed(125000)).toEqual({ dateTime: "PT125S", label: "2m 5s" });
    expect(formatJobElapsed(60000)).toEqual({ dateTime: "PT60S", label: "1m" });
    expect(formatJobElapsed(12500)).toEqual({ dateTime: "PT13S", label: "13s" });
  });
  test("normalizes nonfinite and negative elapsed values", () => {
    expect(formatJobElapsed(Number.NaN)).toEqual({ dateTime: "PT0S", label: "0s" });
    expect(formatJobElapsed(-1000)).toEqual({ dateTime: "PT0S", label: "0s" });
  });
});

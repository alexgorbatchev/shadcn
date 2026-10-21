import { describe, expect, test } from "vitest";
import {
  getNumberRollParts,
  mergeNumberRollParts,
  getRollDelta,
  getNumberRollCellOffset,
} from "../getNumberRollParts.js";

describe("number roll formatting", () => {
  test("keeps surviving place identities when the integer expands", () => {
    const formatter = new Intl.NumberFormat("en-US");
    const previous = getNumberRollParts(99, formatter);
    const next = getNumberRollParts(100, formatter);
    expect(previous.map((part) => part.key)).toEqual(["int:1", "int:0"]);
    expect(mergeNumberRollParts(previous, next)).toEqual([
      { type: "digit", key: "int:2", digit: 1, hasEntered: true },
      { type: "digit", key: "int:1", digit: 0 },
      { type: "digit", key: "int:0", digit: 0 },
    ]);
  });
  test("retains departing columns while animating a smaller value", () => {
    const formatter = new Intl.NumberFormat("en-US");
    const merged = mergeNumberRollParts(getNumberRollParts(100, formatter), getNumberRollParts(9, formatter));
    expect(merged.filter((part) => part.isExiting).map((part) => part.key)).toEqual(["int:2", "int:1"]);
    expect(merged.at(-1)).toEqual({ type: "digit", key: "int:0", digit: 9 });
  });
  test("formats symbols and localized digits without interpreting them as ASCII", () => {
    const formatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });
    const parts = getNumberRollParts(-12.5, formatter, "~", " items");
    const text = parts
      .map((part) => {
        expect(part.type).toBe("symbol");
        if (part.type !== "symbol") throw new Error("Expected a localized symbol");
        return part.value;
      })
      .join("");
    expect(text).toBe(`~${formatter.format(-12.5)} items`);
    expect(parts.every((part) => part.type === "symbol")).toBe(true);
  });
  test("uses the requested roll direction across zero", () => {
    expect(getRollDelta(9, 0, 1)).toBe(1);
    expect(getRollDelta(0, 9, -1)).toBe(-1);
    expect(getRollDelta(0, 9, 0)).toBe(-1);
    expect(getRollDelta(3, 3, -1)).toBe(0);
  });
  test("keeps neighboring glyphs continuous while crossing zero", () => {
    expect(getNumberRollCellOffset(9, 9.5)).toBe(-0.5);
    expect(getNumberRollCellOffset(0, 9.5)).toBe(0.5);
    expect(getNumberRollCellOffset(9, -0.5)).toBe(-0.5);
    expect(getNumberRollCellOffset(0, -0.5)).toBe(0.5);
    expect(getNumberRollCellOffset(5, 0)).toBe(-1);
    expect(getNumberRollCellOffset(4, 0)).toBe(1);
  });
  test("cancels a column exit when the digit returns before its animation ends", () => {
    const formatter = new Intl.NumberFormat("en-US");
    const exiting = mergeNumberRollParts(getNumberRollParts(100, formatter), getNumberRollParts(9, formatter));
    const restored = mergeNumberRollParts(exiting, getNumberRollParts(105, formatter));
    expect(restored).toEqual([
      { type: "digit", key: "int:2", digit: 1 },
      { type: "digit", key: "int:1", digit: 0 },
      { type: "digit", key: "int:0", digit: 5 },
    ]);
  });
});

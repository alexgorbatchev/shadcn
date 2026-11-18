import { expect, test } from "vitest";
import { getDataGridCursorTarget } from "../getDataGridCursorTarget.js";
import { getDataGridRowRange } from "../getDataGridRowRange.js";

const rows = ["a", "b", "c", "d", "e"];

test("moves the cursor in displayed order and stops at either end", () => {
  expect(getDataGridCursorTarget(rows, "b", "next", 2)).toBe("c");
  expect(getDataGridCursorTarget(rows, "b", "previous", 2)).toBe("a");
  expect(getDataGridCursorTarget(rows, "a", "previous", 2)).toBe("a");
  expect(getDataGridCursorTarget(rows, "e", "next", 2)).toBe("e");
  expect(getDataGridCursorTarget(rows, "b", "next-page", 2)).toBe("d");
  expect(getDataGridCursorTarget(rows, "d", "next-page", 2)).toBe("e");
  expect(getDataGridCursorTarget(rows, "b", "previous-page", 5)).toBe("a");
  expect(getDataGridCursorTarget(rows, "c", "first", 2)).toBe("a");
  expect(getDataGridCursorTarget(rows, "c", "last", 2)).toBe("e");
  // A page is at least one row.
  expect(getDataGridCursorTarget(rows, "b", "next-page", 0)).toBe("c");
});

test("starts forward moves at the first row and back moves at the last without a cursor", () => {
  expect(getDataGridCursorTarget(rows, undefined, "next", 2)).toBe("a");
  expect(getDataGridCursorTarget(rows, "gone", "next-page", 2)).toBe("a");
  expect(getDataGridCursorTarget(rows, undefined, "previous", 2)).toBe("e");
  expect(getDataGridCursorTarget(rows, undefined, "previous-page", 2)).toBe("e");
  expect(getDataGridCursorTarget([], "a", "next", 2)).toBeUndefined();
});

test("selects the displayed range between two rows in either direction", () => {
  expect(getDataGridRowRange(rows, "b", "d")).toEqual(["b", "c", "d"]);
  expect(getDataGridRowRange(rows, "d", "b")).toEqual(["b", "c", "d"]);
  expect(getDataGridRowRange(rows, undefined, "c")).toEqual(["c"]);
  expect(getDataGridRowRange(rows, "gone", "c")).toEqual(["c"]);
  expect(getDataGridRowRange(rows, "a", "gone")).toEqual([]);
});

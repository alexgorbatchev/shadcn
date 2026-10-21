import { expect, test } from "vitest";
import { safeHref, hostOf } from "../href.js";

test("rejects blank and malformed navigation targets", () => {
  expect(safeHref(" \t ")).toBeUndefined();
  expect(safeHref("not a URL")).toBeUndefined();
  expect(safeHref("javascript:alert(1)")).toBeUndefined();
});
test("preserves relative navigation without inventing an external host", () => {
  expect(safeHref(" /guide ")).toBe("/guide");
  expect(hostOf("/guide")).toBeUndefined();
  expect(hostOf("mailto:review@example.com")).toBeUndefined();
});

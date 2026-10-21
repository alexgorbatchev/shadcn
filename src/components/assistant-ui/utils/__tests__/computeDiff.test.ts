import { expect, test } from "vitest";
import { computeDiff } from "../diffViewer/computeDiff.js";
import { formatUnifiedDiff } from "../diffViewer/formatUnifiedDiff.js";
import { applyPatch } from "diff";

test("computes changed and unchanged line numbers and totals", () => {
  const result = computeDiff("same\nold\n", "same\nnew\nadded\n");
  expect(result.additions).toBe(2);
  expect(result.deletions).toBe(1);
  expect(result.lines).toEqual([
    { type: "normal", content: "same", oldLineNumber: 1, newLineNumber: 1 },
    { type: "del", content: "old", oldLineNumber: 2 },
    { type: "add", content: "new", newLineNumber: 2 },
    { type: "add", content: "added", newLineNumber: 3 },
  ]);
});

test("copied computed patches preserve missing end-of-file newlines", () => {
  const previous = "same\nold";
  const next = "same\nnew\n";
  const computed = computeDiff(previous, next);
  expect(computed.lines.some((line) => line.type === "marker")).toBe(true);
  const patch = formatUnifiedDiff({ ...computed, oldName: "file.ts", newName: "file.ts" });
  expect(applyPatch(previous, patch)).toBe(next);
});

test("displays unchanged content and handles empty source files", () => {
  expect(computeDiff("same\n", "same\n").lines).toEqual([
    { type: "normal", content: "same", oldLineNumber: 1, newLineNumber: 1 },
  ]);
  expect(computeDiff("", "").lines).toEqual([]);
  expect(computeDiff("", "new\n").additions).toBe(1);
  expect(computeDiff("old\n", "").deletions).toBe(1);
});

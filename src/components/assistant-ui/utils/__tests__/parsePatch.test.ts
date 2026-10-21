import { expect, test } from "vitest";
import { parsePatch } from "../diffViewer/parsePatch.js";
import { formatUnifiedDiff } from "../diffViewer/formatUnifiedDiff.js";
import { createTwoFilesPatch, applyPatch } from "diff";

test("preserves native hunk boundaries, names and missing-newline markers", () => {
  const previous = "first\n" + "same\n".repeat(12) + "last";
  const next = "changed\n" + "same\n".repeat(12) + "updated";
  const patch = createTwoFilesPatch("before.ts", "after.ts", previous, next);
  const file = parsePatch(patch)[0];
  if (!file) throw new Error("Expected a parsed native patch");
  expect(file.oldName).toBe("before.ts");
  expect(file.newName).toBe("after.ts");
  expect(file.hunks).toHaveLength(2);
  expect(file.additions).toBe(2);
  expect(file.deletions).toBe(2);
  expect(applyPatch(previous, formatUnifiedDiff(file))).toBe(next);
});

test("retains /dev/null for created and deleted files", () => {
  const patch = createTwoFilesPatch("/dev/null", "created.ts", "", "created\n");
  const file = parsePatch(patch)[0];
  if (!file) throw new Error("Expected a created file patch");
  expect(formatUnifiedDiff(file)).toContain("--- /dev/null\n+++ b/created.ts");
  expect(applyPatch("", formatUnifiedDiff(file))).toBe("created\n");
});

test("ignores malformed patch input", () => {
  expect(parsePatch("not a patch")).toEqual([]);
});

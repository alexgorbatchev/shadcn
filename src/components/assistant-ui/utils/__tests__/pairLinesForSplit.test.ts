import { expect, test } from "vitest";
import { pairLinesForSplit } from "../diffViewer/pairLinesForSplit.js";
import { parsePatch } from "../diffViewer/parsePatch.js";
import { createTwoFilesPatch } from "diff";

test("aligns replacement lines even when an EOF marker separates deletion and addition", () => {
  const files = parsePatch(createTwoFilesPatch("file", "file", "old", "new\n"));
  const file = files[0];
  if (!file) throw new Error("Expected the native unified patch to produce a file");
  const pairs = pairLinesForSplit(file.lines);
  expect(pairs[0]).toMatchObject({ left: { type: "del", content: "old" }, right: { type: "add", content: "new" } });
  expect(pairs[1]).toMatchObject({ left: { type: "marker" }, right: null });
});

test("retains asymmetric additions and shared context", () => {
  const pairs = pairLinesForSplit([
    { type: "normal", content: "same", oldLineNumber: 1, newLineNumber: 1 },
    { type: "del", content: "old", oldLineNumber: 2 },
    { type: "add", content: "new", newLineNumber: 2 },
    { type: "add", content: "extra", newLineNumber: 3 },
  ]);
  expect(pairs[0]?.left).toEqual(pairs[0]?.right);
  expect(pairs[1]).toMatchObject({ left: { content: "old" }, right: { content: "new" } });
  expect(pairs[2]).toMatchObject({ left: null, right: { content: "extra" } });
});

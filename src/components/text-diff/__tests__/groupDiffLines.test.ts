import { expect, test } from "vitest";
import type { IParsedDiffLine } from "../../assistant-ui/utils/diffViewer/types";
import { groupDiffLines } from "../groupDiffLines";

function lines(types: string): IParsedDiffLine[] {
  return [...types].map((type, index) => ({
    type: type === "+" ? "add" : type === "-" ? "del" : "normal",
    content: `line ${index}`,
  }));
}

function describeSegments(types: string, contextLines: number): string[] {
  return groupDiffLines(lines(types), contextLines).map(
    (segment) => `${segment.kind}:${segment.lines.map((line) => line.content.replace("line ", "")).join(",")}`,
  );
}

test("folds unchanged runs beyond the context around each change", () => {
  expect(describeSegments("....-+....", 1)).toEqual(["unchanged:0,1,2", "lines:3,4,5,6", "unchanged:7,8,9"]);
});

test("keeps a hidden run of one line shown, since folding it saves nothing", () => {
  expect(describeSegments(".-...+.", 1)).toEqual(["lines:0,1,2,3,4,5,6"]);
});

test("shows every line when nothing changed, and nothing for empty text", () => {
  expect(describeSegments("....", 1)).toEqual(["lines:0,1,2,3"]);
  expect(describeSegments("", 1)).toEqual([]);
});

test("folds the unchanged middle between two distant changes", () => {
  expect(describeSegments("-......+", 2)).toEqual(["lines:0,1,2", "unchanged:3,4", "lines:5,6,7"]);
});

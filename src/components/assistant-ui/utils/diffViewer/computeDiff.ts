import { createTwoFilesPatch } from "diff";
import { parsePatch } from "./parsePatch.js";
import type { IComputedDiff, IParsedDiffLine } from "./types.js";
export function computeDiff(oldContent: string, newContent: string): IComputedDiff {
  if (oldContent !== newContent) {
    const file = parsePatch(
      createTwoFilesPatch("file", "file", oldContent, newContent, undefined, undefined, { context: Infinity }),
    )[0];
    if (!file) throw new Error("The native diff generator did not produce a parseable unified patch");
    return { lines: file.lines, hunks: file.hunks, additions: file.additions, deletions: file.deletions };
  }
  const lines: IParsedDiffLine[] =
    oldContent.length === 0
      ? []
      : oldContent
          .replace(/\n$/u, "")
          .split("\n")
          .map((content, index) => ({ type: "normal", content, oldLineNumber: index + 1, newLineNumber: index + 1 }));
  const start = lines.length === 0 ? 0 : 1;
  return {
    lines,
    hunks: [{ header: "@@ -" + start + "," + lines.length + " +" + start + "," + lines.length + " @@", lines }],
    additions: 0,
    deletions: 0,
  };
}

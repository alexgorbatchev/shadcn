import parseDiff from "parse-diff";
import type { IParsedDiffLine, IParsedDiffFile } from "./types.js";
export function parsePatch(patch: string): IParsedDiffFile[] {
  const files = parseDiff(patch);
  return files.map((file) => {
    const hunks = file.chunks.map((chunk) => {
      const lines: IParsedDiffLine[] = [];
      for (const change of chunk.changes) {
        if (change.content.startsWith("\\")) {
          lines.push({ type: "marker", content: change.content });
        } else if (change.type === "add") {
          lines.push({
            type: "add",
            content: change.content.slice(1),
            newLineNumber: change.ln,
          });
        } else if (change.type === "del") {
          lines.push({
            type: "del",
            content: change.content.slice(1),
            oldLineNumber: change.ln,
          });
        } else {
          lines.push({
            type: "normal",
            content: change.content.slice(1),
            oldLineNumber: change.ln1,
            newLineNumber: change.ln2,
          });
        }
      }
      return { header: chunk.content, lines };
    });
    const lines = hunks.flatMap((hunk) => hunk.lines);
    let additions = 0;
    let deletions = 0;
    for (const line of lines) {
      if (line.type === "add") additions++;
      if (line.type === "del") deletions++;
    }
    return {
      oldName: file.from,
      newName: file.to,
      lines,
      hunks,
      additions,
      deletions,
    };
  });
}

import type { IParsedDiffLine, IParsedDiffFile } from "./types.js";
function formatDiffLine(line: IParsedDiffLine): string {
  if (line.type === "marker") return line.content;
  const indicator = line.type === "add" ? "+" : line.type === "del" ? "-" : " ";
  return `${indicator}${line.content}`;
}
function formatDiffFileName(name: string | undefined, prefix: "a" | "b") {
  return name === "/dev/null" ? name : `${prefix}/${name ?? "file"}`;
}
export function formatUnifiedDiff(file: IParsedDiffFile): string {
  return [
    `--- ${formatDiffFileName(file.oldName, "a")}`,
    `+++ ${formatDiffFileName(file.newName, "b")}`,
    ...file.hunks.flatMap((hunk) => [hunk.header, ...hunk.lines.map(formatDiffLine)]),
  ].join("\n");
}

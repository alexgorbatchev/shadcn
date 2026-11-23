import type { IParsedDiffLine } from "../assistant-ui/utils/diffViewer/types.js";
import type { TextDiffSegment } from "./types.js";

/**
 * Splits diff lines into shown lines and runs of unchanged lines that fold away: an unchanged line stays shown when it
 * is within `contextLines` of a change, and a hidden run of one line stays shown because folding it saves nothing. With
 * no change at all, every line stays shown.
 */
export function groupDiffLines(lines: readonly IParsedDiffLine[], contextLines: number): TextDiffSegment[] {
  const changed = lines.flatMap((line, index) => (line.type === "add" || line.type === "del" ? [index] : []));
  if (changed.length === 0) return lines.length ? [{ kind: "lines", lines: [...lines] }] : [];
  const isNearChange = (index: number): boolean =>
    changed.some((changedIndex) => Math.abs(changedIndex - index) <= contextLines);
  const segments: TextDiffSegment[] = [];
  let index = 0;
  while (index < lines.length) {
    const start = index;
    const isShown = isNearChange(index);
    while (index < lines.length && isNearChange(index) === isShown) index += 1;
    const run = lines.slice(start, index);
    const previous = segments.at(-1);
    if (isShown || run.length < 2) {
      if (previous?.kind === "lines") previous.lines.push(...run);
      else segments.push({ kind: "lines", lines: run });
    } else segments.push({ kind: "unchanged", start, lines: run });
  }
  return segments;
}

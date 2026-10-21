import type { IParsedDiffLine, ISplitDiffLinePair } from "./types.js";
export function pairLinesForSplit(lines: readonly IParsedDiffLine[]): ISplitDiffLinePair[] {
  const pairs: ISplitDiffLinePair[] = [];
  let index = 0;
  const takeBlock = (kind: "del" | "add"): IParsedDiffLine[] => {
    const block: IParsedDiffLine[] = [];
    while (index < lines.length) {
      const next = lines[index];
      if (!next || (next.type !== kind && next.type !== "marker")) break;
      block.push(next);
      index += 1;
    }
    return block;
  };
  while (index < lines.length) {
    const line = lines[index];
    if (!line) break;
    if (line.type === "normal" || line.type === "marker") {
      pairs.push({ left: line, right: line });
      index += 1;
      continue;
    }
    const deletions = takeBlock("del");
    const additions = takeBlock("add");
    for (let pairIndex = 0; pairIndex < Math.max(deletions.length, additions.length); pairIndex += 1)
      pairs.push({ left: deletions[pairIndex] ?? null, right: additions[pairIndex] ?? null });
  }
  return pairs;
}

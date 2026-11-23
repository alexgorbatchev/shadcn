import type { IParsedDiffLine } from "../assistant-ui/utils/diffViewer/types.js";

/** How a text diff lays out its two versions: by its own width, always stacked, or always side by side. */
export type TextDiffViewMode = "auto" | "unified" | "split";

/** Lines a text diff shows, or a run of unchanged lines that folds away; `start` is the run's first line index. */
export type TextDiffSegment =
  | { kind: "lines"; lines: IParsedDiffLine[] }
  | { kind: "unchanged"; start: number; lines: IParsedDiffLine[] };

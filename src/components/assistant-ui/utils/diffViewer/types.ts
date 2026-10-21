export type DiffLineType = "add" | "del" | "normal" | "marker";
export interface IDiffViewerInputFile {
  content: string;
  name?: string;
}
export interface IComputedDiff {
  lines: IParsedDiffLine[];
  hunks: IParsedDiffHunk[];
  additions: number;
  deletions: number;
}
export interface IParsedDiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number | undefined;
  newLineNumber?: number | undefined;
}
export interface IParsedDiffHunk {
  header: string;
  lines: IParsedDiffLine[];
}
export interface IParsedDiffFile {
  oldName?: string | undefined;
  newName?: string | undefined;
  lines: IParsedDiffLine[];
  hunks: IParsedDiffHunk[];
  additions: number;
  deletions: number;
}
export interface ISplitDiffLinePair {
  left: IParsedDiffLine | null;
  right: IParsedDiffLine | null;
}

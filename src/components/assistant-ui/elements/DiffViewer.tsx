import type { ComponentProps, JSX } from "react";
import { useMemo } from "react";
import type { SyntaxHighlighterProps } from "@assistant-ui/react-markdown";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn.js";
import type { IDiffViewerInputFile, IParsedDiffFile, ISplitDiffLinePair } from "../utils/diffViewer/types.js";
import { diffViewerVariants } from "../utils/diffViewer/constants.js";
import { parsePatch } from "../utils/diffViewer/parsePatch.js";
import { computeDiff } from "../utils/diffViewer/computeDiff.js";
import { pairLinesForSplit } from "../utils/diffViewer/pairLinesForSplit.js";
import { DiffViewerFileContent } from "./DiffViewerFileContent.js";
import { Empty, EmptyTitle } from "../../Empty.js";
export type DiffViewerProps = Omit<ComponentProps<"div">, "children" | "dangerouslySetInnerHTML"> &
  Partial<SyntaxHighlighterProps> &
  VariantProps<typeof diffViewerVariants> & {
    patch?: string | undefined;
    oldFile?: IDiffViewerInputFile | undefined;
    newFile?: IDiffViewerInputFile | undefined;
    viewMode?: "split" | "unified" | undefined;
    showLineNumbers?: boolean | undefined;
    showIcon?: boolean | undefined;
    showStats?: boolean | undefined;
    copyable?: boolean | undefined;
    maxCollapsedLines?: number | undefined;
    className?: string | undefined;
  };
export function DiffViewer({
  code,
  patch,
  oldFile,
  newFile,
  viewMode = "unified",
  showLineNumbers = true,
  showIcon = false,
  showStats = true,
  copyable = true,
  maxCollapsedLines,
  variant,
  size,
  className,
  components: _components,
  language: _language,
  node: _node,
  ...props
}: DiffViewerProps): JSX.Element {
  const diffPatch = patch ?? code;
  const oldContent = oldFile?.content;
  const oldName = oldFile?.name;
  const newContent = newFile?.content;
  const newName = newFile?.name;
  const parsedFiles = useMemo<IParsedDiffFile[]>(() => {
    if (diffPatch) {
      return parsePatch(diffPatch);
    }
    if (oldContent !== undefined && newContent !== undefined) {
      const { lines, hunks, additions, deletions } = computeDiff(oldContent, newContent);
      return [
        {
          oldName,
          newName,
          lines,
          hunks,
          additions,
          deletions,
        },
      ];
    }
    return [];
  }, [diffPatch, oldContent, oldName, newContent, newName]);
  const splitLinePairs = useMemo<ISplitDiffLinePair[][]>(() => {
    if (viewMode !== "split") return [];
    return parsedFiles.map((file) => pairLinesForSplit(file.lines));
  }, [parsedFiles, viewMode]);
  if (parsedFiles.length === 0) {
    return (
      <Empty data-testid="DiffViewer" {...props} className={cn(diffViewerVariants({ variant, size }), className)}>
        <EmptyTitle>No diff content provided</EmptyTitle>
      </Empty>
    );
  }
  return (
    <div
      data-testid="DiffViewer"
      {...props}
      data-slot="diff-viewer"
      data-view-mode={viewMode}
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(diffViewerVariants({ variant, size }), className)}
    >
      {parsedFiles.map((file, fileIndex) => (
        <DiffViewerFileContent
          key={fileIndex}
          file={file}
          splitLinePairs={splitLinePairs[fileIndex] ?? []}
          viewMode={viewMode}
          showLineNumbers={showLineNumbers}
          showIcon={showIcon}
          showStats={showStats}
          copyable={copyable}
          maxCollapsedLines={maxCollapsedLines}
        />
      ))}
    </div>
  );
}

import type { JSX } from "react";
import { useId, useState } from "react";
import { Button } from "../../Button.js";
import type { IParsedDiffFile, ISplitDiffLinePair } from "../utils/diffViewer/types.js";
import { formatUnifiedDiff } from "../utils/diffViewer/formatUnifiedDiff.js";
import { DiffViewerFile } from "./DiffViewerFile.js";
import { DiffViewerContent } from "./DiffViewerContent.js";
import { DiffViewerHeader } from "./DiffViewerHeader.js";
import { DiffViewerLine } from "./DiffViewerLine.js";
import { DiffViewerSplitLine } from "./DiffViewerSplitLine.js";
interface IDiffViewerFileContentProps {
  file: IParsedDiffFile;
  splitLinePairs: ISplitDiffLinePair[];
  viewMode: "split" | "unified";
  showLineNumbers: boolean;
  showIcon: boolean;
  showStats: boolean;
  copyable: boolean;
  maxCollapsedLines: number | undefined;
}
export function DiffViewerFileContent({
  file,
  splitLinePairs,
  viewMode,
  showLineNumbers,
  showIcon,
  showStats,
  copyable,
  maxCollapsedLines,
}: IDiffViewerFileContentProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();
  const renderedLineCount = viewMode === "split" ? splitLinePairs.length : file.lines.length;
  const isCollapsible =
    maxCollapsedLines !== undefined && maxCollapsedLines >= 0 && renderedLineCount > maxCollapsedLines;
  const isCollapsed = isCollapsible && !isExpanded;
  const visibleLineCount = isCollapsed ? maxCollapsedLines : renderedLineCount;
  return (
    <DiffViewerFile className="border-frame-edge [contain-intrinsic-size:auto_240px] [content-visibility:auto] not-first:border-t">
      <DiffViewerHeader
        oldName={file.oldName}
        newName={file.newName}
        additions={file.additions}
        deletions={file.deletions}
        showIcon={showIcon}
        showStats={showStats}
        copyText={formatUnifiedDiff(file)}
        copyable={copyable}
      />
      <DiffViewerContent id={contentId} className="py-2">
        {viewMode === "split"
          ? splitLinePairs
              .slice(0, visibleLineCount)
              .map((pair, pairIndex) => (
                <DiffViewerSplitLine key={pairIndex} pair={pair} showLineNumbers={showLineNumbers} />
              ))
          : file.lines
              .slice(0, visibleLineCount)
              .map((line, lineIndex) => (
                <DiffViewerLine key={lineIndex} line={line} showLineNumbers={showLineNumbers} />
              ))}
      </DiffViewerContent>
      {isCollapsible && (
        <div className="border-frame-edge flex border-t px-3.5 py-1.5">
          <Button
            type="button"
            aria-expanded={!isCollapsed}
            aria-controls={contentId}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            variant="ghost"
            size="sm"
          >
            {isCollapsed ? `Show all ${renderedLineCount} lines` : "Show less"}
          </Button>
        </div>
      )}
    </DiffViewerFile>
  );
}

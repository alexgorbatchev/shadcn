import { DiffViewerText } from "./DiffViewerText.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import type { IParsedDiffLine } from "../utils/diffViewer/types.js";
import { diffLineVariants, diffLineTextVariants } from "../utils/diffViewer/constants.js";
interface IDiffViewerLineProps extends ComponentProps<"div"> {
  line: IParsedDiffLine;
  showLineNumbers?: boolean | undefined;
}
export function DiffViewerLine({
  line,
  showLineNumbers = true,
  className,
  ...props
}: IDiffViewerLineProps): JSX.Element {
  const indicator = line.type === "add" ? "+" : line.type === "del" ? "-" : line.type === "marker" ? "" : " ";
  return (
    <div
      data-testid="DiffViewerLine"
      data-slot="diff-viewer-line"
      data-type={line.type}
      className={cn(diffLineVariants({ type: line.type }), className)}
      {...props}
    >
      {showLineNumbers && (
        <span
          data-slot="diff-viewer-line-number"
          className="text-muted-foreground w-10 shrink-0 px-2 text-end tabular-nums select-none"
        >
          {line.type === "marker"
            ? ""
            : line.type === "del"
              ? line.oldLineNumber
              : line.type === "add"
                ? line.newLineNumber
                : line.oldLineNumber}
        </span>
      )}
      <span
        data-slot="diff-viewer-indicator"
        className={cn("w-4 shrink-0 text-center select-none", diffLineTextVariants({ type: line.type }))}
      >
        {indicator}
      </span>
      <DiffViewerText line={line} />
    </div>
  );
}

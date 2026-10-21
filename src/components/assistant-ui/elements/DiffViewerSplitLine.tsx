import { DiffViewerText } from "./DiffViewerText.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import type { ISplitDiffLinePair } from "../utils/diffViewer/types.js";
import { diffLineVariants, diffLineTextVariants } from "../utils/diffViewer/constants.js";
interface IDiffViewerSplitLineProps extends ComponentProps<"div"> {
  pair: ISplitDiffLinePair;
  showLineNumbers?: boolean | undefined;
}
export function DiffViewerSplitLine({
  pair,
  showLineNumbers = true,
  className,
  ...props
}: IDiffViewerSplitLineProps): JSX.Element {
  const { left, right } = pair;
  return (
    <div
      data-testid="DiffViewerSplitLine"
      data-slot="diff-viewer-split-line"
      className={cn("flex", className)}
      {...props}
    >
      <div
        data-slot="diff-viewer-split-left"
        data-type={left?.type ?? "empty"}
        className={cn("border-frame-edge flex w-1/2 border-e", diffLineVariants({ type: left?.type ?? "empty" }))}
      >
        {showLineNumbers && (
          <span className="text-muted-foreground w-10 shrink-0 px-2 text-end tabular-nums select-none">
            {left?.oldLineNumber ?? ""}
          </span>
        )}
        <span
          className={cn("w-4 shrink-0 text-center select-none", diffLineTextVariants({ type: left?.type ?? "empty" }))}
        >
          {left ? (left.type === "del" ? "-" : left.type === "marker" ? "" : " ") : ""}
        </span>
        <DiffViewerText line={left} />
      </div>
      <div
        data-slot="diff-viewer-split-right"
        data-type={right?.type ?? "empty"}
        className={cn("flex w-1/2", diffLineVariants({ type: right?.type ?? "empty" }))}
      >
        {showLineNumbers && (
          <span className="text-muted-foreground w-10 shrink-0 px-2 text-end tabular-nums select-none">
            {right?.newLineNumber ?? ""}
          </span>
        )}
        <span
          className={cn("w-4 shrink-0 text-center select-none", diffLineTextVariants({ type: right?.type ?? "empty" }))}
        >
          {right ? (right.type === "add" ? "+" : right.type === "marker" ? "" : " ") : ""}
        </span>
        <DiffViewerText line={right} />
      </div>
    </div>
  );
}

import type { ComponentProps, JSX } from "react";
import { Fragment, useId, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn.js";
import { Button } from "../Button.js";
import { computeDiff } from "../assistant-ui/utils/diffViewer/computeDiff.js";
import { pairLinesForSplit } from "../assistant-ui/utils/diffViewer/pairLinesForSplit.js";
import { diffViewerVariants } from "../assistant-ui/utils/diffViewer/constants.js";
import { DiffViewerLine } from "../assistant-ui/elements/DiffViewerLine.js";
import { DiffViewerSplitLine } from "../assistant-ui/elements/DiffViewerSplitLine.js";
import { useElementSize } from "../image-viewer/hooks/useElementSize.js";
import { groupDiffLines } from "./groupDiffLines.js";
import type { TextDiffViewMode } from "./types.js";

export interface ITextDiffProps extends Omit<ComponentProps<"div">, "children"> {
  /** The earlier text. */
  before: string;
  /** The later text. */
  after: string;
  /** Names the earlier text, such as "Current"; defaults to "Before". */
  beforeLabel?: string | undefined;
  /** Names the later text, such as "Proposed"; defaults to "After". */
  afterLabel?: string | undefined;
  /** `auto` (default) shows the versions side by side from `splitMinWidth` of its own width and stacked below it. */
  viewMode?: TextDiffViewMode | undefined;
  /** The narrowest own width, in pixels, that shows the versions side by side in `auto` mode; defaults to 560. */
  splitMinWidth?: number | undefined;
  /** Unchanged lines kept around each change; longer unchanged runs fold behind a button. Defaults to 3. */
  contextLines?: number | undefined;
  showLineNumbers?: boolean | undefined;
}

const SPLIT_MIN_WIDTH = 560;
const CONTEXT_LINES = 3;

function withFinalNewline(text: string): string {
  return text === "" || text.endsWith("\n") ? text : `${text}\n`;
}

function formatUnchanged(count: number): string {
  return `${count} unchanged ${count === 1 ? "line" : "lines"}`;
}

interface ISignLabelProps {
  sign: "-" | "+";
  label: string;
}

/** A version's name with the sign its lines carry, so the legend reads without colour. */
function SignLabel({ sign, label }: ISignLabelProps): JSX.Element {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span aria-hidden="true" className={sign === "-" ? "text-destructive" : "text-success"}>
        {sign}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}

/**
 * Two versions of a text as a line diff: removed lines carry "-" and added lines "+" in a sign gutter as well as colour,
 * long lines wrap, and long unchanged runs fold behind a button. In `auto` mode the versions sit side by side once the
 * diff is `splitMinWidth` wide and stack below that.
 */
export function TextDiff({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  viewMode = "auto",
  splitMinWidth = SPLIT_MIN_WIDTH,
  contextLines = CONTEXT_LINES,
  showLineNumbers = true,
  className,
  ...props
}: ITextDiffProps): JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const size = useElementSize(container);
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
  const idPrefix = useId();
  const segments = useMemo(
    // A missing final newline is no change a reader can see, so both versions end with one before they are compared.
    () => groupDiffLines(computeDiff(withFinalNewline(before), withFinalNewline(after)).lines, contextLines),
    [before, after, contextLines],
  );
  // Before the first measurement, as on the server, the versions stack: it fits every width.
  const isSplit = viewMode === "split" || (viewMode === "auto" && size !== undefined && size.width >= splitMinWidth);
  const renderLines = (lines: Parameters<typeof pairLinesForSplit>[0]) =>
    isSplit
      ? pairLinesForSplit(lines).map((pair, index) => (
          <DiffViewerSplitLine key={index} pair={pair} showLineNumbers={showLineNumbers} />
        ))
      : lines.map((line, index) => <DiffViewerLine key={index} line={line} showLineNumbers={showLineNumbers} />);
  const toggle = (start: number) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(start)) next.add(start);
      return next;
    });
  return (
    <div
      ref={container}
      data-testid="TextDiff"
      data-slot="text-diff"
      data-view-mode={isSplit ? "split" : "unified"}
      data-scroll="none"
      {...props}
      className={cn(diffViewerVariants({ variant: "default", size: "sm" }), className)}
    >
      <div
        data-testid="TextDiff--legend"
        className={cn(
          "flex min-h-control-lg items-center gap-control-gap border-b border-frame-edge px-control-x text-xs font-medium tracking-wide text-muted-foreground",
          isSplit && "[&>*]:w-1/2",
        )}
      >
        <SignLabel sign="-" label={beforeLabel} />
        <SignLabel sign="+" label={afterLabel} />
      </div>
      <div className="py-2">
        {segments.map((segment, segmentIndex) => {
          if (segment.kind === "lines") return <Fragment key={segmentIndex}>{renderLines(segment.lines)}</Fragment>;
          const isExpanded = expanded.has(segment.start);
          const regionId = `${idPrefix}-${segment.start}`;
          return (
            <Fragment key={segmentIndex}>
              <div className="flex px-control-x py-0.5 font-sans">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-expanded={isExpanded}
                  aria-controls={regionId}
                  onClick={() => toggle(segment.start)}
                >
                  {isExpanded
                    ? `Hide ${formatUnchanged(segment.lines.length)}`
                    : `Show ${formatUnchanged(segment.lines.length)}`}
                </Button>
              </div>
              <div id={regionId} hidden={!isExpanded}>
                {isExpanded && renderLines(segment.lines)}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

import { parseTerminalLine } from "../utils/parseTerminalLine.js";
import { TerminalAnsiFragment } from "./TerminalAnsiFragment.js";
import { Button } from "../../Button.js";
import type { JSX } from "react";
type TerminalBlockProps = Omit<
  ComponentProps<"div">,
  | "children"
  | "command"
  | "lines"
  | "visibleCount"
  | "done"
  | "variant"
  | "exitCode"
  | "stderr"
  | "cwd"
  | "durationMs"
  | "truncated"
  | "maxCollapsedLines"
> & {
  command: string;
  lines: readonly string[];
  visibleCount: number;
  done: boolean;
  variant?: "paper" | "ink" | undefined;
  exitCode?: number | undefined;
  stderr?: readonly string[] | undefined;
  cwd?: string | undefined;
  durationMs?: number | undefined;
  truncated?: boolean | undefined;
  maxCollapsedLines?: number | undefined;
};
import { useId, useState, type ComponentProps } from "react";
import { CheckIcon, CopyIcon, Loader2Icon, XIcon } from "lucide-react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard.js";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { clamp, take } from "../utils/range.js";
const formatDuration = (durationMs: number) => {
  const duration = Math.floor(clamp(durationMs, 0, Number.MAX_SAFE_INTEGER));
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) {
    const seconds = Math.round(duration / 100) / 10;
    return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};
export function TerminalBlock({
  command,
  lines,
  visibleCount,
  done,
  variant = "paper",
  exitCode: exitCodeProp,
  stderr,
  cwd,
  durationMs,
  truncated,
  maxCollapsedLines,
  className,
  ...props
}: TerminalBlockProps): JSX.Element {
  const ink = variant === "ink";
  const exitCode = exitCodeProp ?? 0;
  const failed = done && exitCode !== 0;
  const state = !done ? "running" : failed ? "failed" : "done";
  const output = [
    ...lines.map((line) => ({ line, stderr: false })),
    ...(stderr ?? []).map((line) => ({ line, stderr: true })),
  ];
  const revealedLines = take(output, visibleCount);
  const collapsedLines = Math.floor(clamp(maxCollapsedLines ?? revealedLines.length, 0, revealedLines.length));
  const canCollapse = done && maxCollapsedLines !== undefined && revealedLines.length > collapsedLines;
  const [expanded, setExpanded] = useState(false);
  const displayedLines = canCollapse && !expanded ? take(revealedLines, collapsedLines) : revealedLines;
  const outputId = useId();
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  return (
    <div
      data-testid="TerminalBlock"
      className={cn(
        cn(
          ink ? "bg-(--terminal-background) border border-border" : paper,
          "w-full max-w-md overflow-hidden rounded-md font-mono text-sm",
        ),
        className,
      )}
      {...props}
      data-slot="terminal-block"
      data-state={state}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1.5">
        <span className={cn("min-w-0 break-words", ink ? "text-muted-foreground" : "text-foreground")}>
          {cwd ? <span className={cn(ink ? "text-muted-foreground" : "text-muted-foreground")}>{cwd} $ </span> : null}
          {command}
        </span>
        {done ? (
          <div className="flex shrink-0 items-center gap-1">
            {failed ? (
              <XIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
            ) : (
              <CheckIcon aria-hidden="true" className={cn("size-4")} />
            )}
            <span
              className={cn(
                mono,
                failed ? "text-destructive" : ink ? "text-muted-foreground" : "text-muted-foreground",
              )}
            >
              exit {exitCode}
            </span>
            {durationMs !== undefined ? (
              <span className={cn(mono, ink ? "text-muted-foreground" : "text-muted-foreground")}>
                {formatDuration(durationMs)}
              </span>
            ) : null}
            {output.length > 0 ? (
              <Button
                type="button"
                aria-label="Copy output"
                onClick={() => copyToClipboard(output.map(({ line }) => parseTerminalLine(line).text).join("\n"))}
                variant="ghost"
              >
                {isCopied ? (
                  <CheckIcon aria-hidden="true" data-icon="inline-start" />
                ) : (
                  <CopyIcon aria-hidden="true" data-icon="inline-start" />
                )}
              </Button>
            ) : null}
          </div>
        ) : (
          <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
        )}
      </div>
      <div
        className={cn(
          "flex min-h-[136px] flex-col gap-1 px-4 pt-1 pb-3.5",
          ink ? "text-muted-foreground" : "text-muted-foreground",
        )}
      >
        <div id={outputId} className="flex flex-col gap-1">
          {displayedLines.map(({ line, stderr: isStderr }, index) => {
            const isLast = index === revealedLines.length - 1;
            return (
              <div
                key={`${index}-${line}`}
                className={cn(
                  "fade-in animate-in fill-mode-both break-words whitespace-pre-wrap duration-300 motion-reduce:animate-none",
                  isStderr ? "text-destructive" : isLast && (ink ? "text-muted-foreground" : "text-foreground"),
                )}
              >
                {parseTerminalLine(line).fragments.map((fragment, fragmentIndex) => (
                  <TerminalAnsiFragment
                    key={fragmentIndex}
                    fragment={isStderr ? { ...fragment, foregroundColor: null } : fragment}
                  />
                ))}
              </div>
            );
          })}
        </div>
        {canCollapse ? (
          <Button
            type="button"
            aria-expanded={expanded}
            aria-controls={outputId}
            onClick={() => setExpanded((value) => !value)}
            variant="ghost"
          >
            {expanded ? "Show less" : `Show all ${revealedLines.length} lines`}
          </Button>
        ) : null}
        {truncated ? (
          <span className={cn(mono, ink ? "text-muted-foreground" : "text-muted-foreground")}>output truncated</span>
        ) : null}
        {!done && (
          <span
            aria-hidden
            className="inline-block h-3 w-1.5 animate-pulse bg-primary/70 motion-reduce:animate-none bg-primary/70"
          />
        )}
      </div>
    </div>
  );
}

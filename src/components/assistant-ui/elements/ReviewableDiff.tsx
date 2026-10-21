import { Button } from "../../Button.js";
import type { JSX } from "react";
type ReviewableDiffProps = Omit<
  ComponentProps<"div">,
  "children" | "filename" | "hunks" | "onKeep" | "onDiscard" | "onApply"
> & {
  filename: string;
  hunks: readonly IDiffHunk[];
  onKeep?: (id: string) => void;
  onDiscard?: (id: string) => void;
  onApply?: () => void;
};
import type { ComponentProps } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { codeScroll, codeSurface, mono, paper } from "./constants.js";
import type { IDiffLine } from "./CodeDiff.js";
export type HunkDecision = "pending" | "kept" | "discarded";
export interface IDiffHunk {
  id: string;
  range: string;
  decision: HunkDecision;
  lines: readonly IDiffLine[];
}
const GUTTER = { context: "", added: "+", removed: "−" } as const;
export function ReviewableDiff({
  filename,
  hunks,
  onKeep,
  onDiscard,
  onApply,
  className,
  ...props
}: ReviewableDiffProps): JSX.Element {
  const kept = hunks.filter((hunk) => hunk.decision === "kept").length;
  const pending = hunks.filter((hunk) => hunk.decision === "pending").length;
  return (
    <div
      data-testid="ReviewableDiff"
      data-slot="reviewable-diff"
      className={cn(cn(paper, "flex w-full max-w-md flex-col overflow-hidden rounded-md"), className)}
      {...props}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="font-mono text-sm">{filename}</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {kept} of {hunks.length} kept
        </span>
      </div>

      <div className="flex flex-col">
        {hunks.map((hunk) => (
          <div
            key={hunk.id}
            className={cn(
              "border-foreground/[0.06] border-t transition-opacity duration-300",
              hunk.decision === "discarded" && "border-dashed",
            )}
          >
            <div className="flex items-center gap-2 px-4 py-1.5">
              <span className={cn(mono, "text-muted-foreground")}>{hunk.range}</span>
              <span className="ms-auto flex items-center gap-1">
                {hunk.decision === "pending" && (onKeep || onDiscard) ? (
                  <>
                    {onDiscard && (
                      <Button
                        type="button"
                        aria-label={`Discard hunk ${hunk.range}`}
                        onClick={() => onDiscard(hunk.id)}
                        variant="ghost"
                      >
                        <XIcon aria-hidden="true" data-icon="inline-start" />
                        Discard
                      </Button>
                    )}
                    {onKeep && (
                      <Button
                        type="button"
                        aria-label={`Keep hunk ${hunk.range}`}
                        onClick={() => onKeep(hunk.id)}
                        variant="ghost"
                      >
                        <CheckIcon aria-hidden="true" data-icon="inline-start" />
                        Keep
                      </Button>
                    )}
                  </>
                ) : (
                  <span
                    className={cn(
                      mono,
                      "fade-in animate-in duration-300",
                      hunk.decision === "kept" ? "text-success text-success" : "text-muted-foreground",
                    )}
                  >
                    {hunk.decision}
                  </span>
                )}
              </span>
            </div>
            <div className={cn(codeScroll, "pb-1.5 font-mono text-sm")}>
              <div className={codeSurface}>
                {hunk.lines.map((line, i) => (
                  <div
                    key={`${hunk.id}-${i}`}
                    className={cn(
                      "flex px-4 py-0.5 leading-relaxed whitespace-pre",
                      line.kind === "context" && "text-muted-foreground",
                      line.kind === "added" && "bg-success/10 text-foreground",
                      line.kind === "removed" && "bg-destructive/10 text-foreground",
                    )}
                  >
                    <span className="w-4 shrink-0 select-none">{GUTTER[line.kind]}</span>
                    <span>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-foreground/[0.06] flex items-center justify-between border-t px-4 py-2.5">
        <span className={cn(mono, "text-muted-foreground")}>
          {pending > 0 ? `${pending} left to review` : "All reviewed"}
        </span>
        {onApply && (
          <Button type="button" disabled={pending > 0} onClick={onApply} variant="default">
            Apply {kept}
          </Button>
        )}
      </div>
    </div>
  );
}

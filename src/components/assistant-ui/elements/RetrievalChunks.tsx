import { ShareMeter } from "./ShareMeter.js";
import type { JSX } from "react";
type RetrievalChunksProps = Omit<
  ComponentProps<"div">,
  "children" | "query" | "chunks" | "visibleCount" | "searching"
> & {
  query: string;
  chunks: readonly IRetrievalChunk[];
  visibleCount: number;
  searching: boolean;
};
import type { ComponentProps } from "react";
import { DatabaseIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
import { announced, pct, take } from "../utils/range.js";
export interface IRetrievalChunk {
  id: string;
  source: string;
  locator: string;
  score: number;
  text: string;
}
export function RetrievalChunks({
  query,
  chunks,
  visibleCount,
  searching,
  className,
  ...props
}: RetrievalChunksProps): JSX.Element {
  return (
    <div
      data-testid="RetrievalChunks"
      data-slot="retrieval-chunks"
      className={cn(cn("flex w-full max-w-sm flex-col gap-2.5"), className)}
      {...props}
    >
      <span
        className={cn(
          field,
          "text-muted-foreground inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-sm",
        )}
      >
        <DatabaseIcon aria-hidden="true" className={cn("size-4")} />
        {query}
      </span>

      <div className="text-muted-foreground text-sm">
        {searching ? (
          <ShimmerLabel>Retrieving</ShimmerLabel>
        ) : (
          <span className="fade-in animate-in duration-300">{chunks.length} passages above threshold</span>
        )}
      </div>

      <div className="flex min-h-[112px] flex-col gap-1.5">
        {take(chunks, visibleCount).map((chunk) => (
          <div
            key={chunk.id}
            className={cn(
              paper,
              "fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex flex-col gap-1.5 rounded-md px-3.5 py-2.5 duration-300",
            )}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-foreground min-w-0 flex-1 truncate text-base font-medium">{chunk.source}</span>
              <span className={cn(mono, "text-muted-foreground shrink-0")}>{chunk.locator}</span>
              <span
                className={cn(
                  mono,
                  "shrink-0 tabular-nums",
                  chunk.score >= 0.8 ? "text-success text-success" : "text-muted-foreground",
                )}
              >
                {chunk.score.toFixed(2)}
              </span>
            </div>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{chunk.text}</p>
            <ShareMeter
              label={`${chunk.source} relevance score`}
              percentage={announced(pct(chunk.score, 1))}
              valueText={`${chunk.score.toFixed(2)} of 1.00`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

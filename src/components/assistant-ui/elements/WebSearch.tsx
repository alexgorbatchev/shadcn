import type { JSX } from "react";
type WebSearchProps = Omit<
  ComponentProps<"div">,
  "children" | "query" | "results" | "visibleResults" | "searching" | "cycle"
> & {
  query: string;
  results: readonly IWebSearchResult[];
  visibleResults: number;
  searching: boolean;
  cycle: number;
};
import type { ComponentProps } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
import { take } from "../utils/range.js";
export interface IWebSearchResult {
  title: string;
  domain: string;
}
export function WebSearch({
  query,
  results,
  visibleResults,
  searching,
  cycle,
  className,
  ...props
}: WebSearchProps): JSX.Element {
  return (
    <div
      data-testid="WebSearch"
      data-slot="web-search"
      className={cn(cn("flex w-full max-w-sm flex-col gap-2.5"), className)}
      {...props}
    >
      <span
        className={cn(
          field,
          "text-muted-foreground inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-sm",
        )}
      >
        <SearchIcon aria-hidden="true" className={cn("size-4")} />
        {query}
      </span>
      <div className="text-muted-foreground text-sm">
        {searching ? (
          <ShimmerLabel>Searching</ShimmerLabel>
        ) : (
          <span className="fade-in animate-in duration-300">Read 3 sources</span>
        )}
      </div>
      <div className="flex min-h-[92px] flex-col">
        {take(results, visibleResults).map((result) => (
          <div
            key={`${cycle}-${result.domain}`}
            className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both hover:bg-foreground/[0.03] -mx-2.5 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors duration-300"
          >
            <span className="bg-foreground/[0.06] text-muted-foreground flex size-4 shrink-0 items-center justify-center rounded text-[9px] font-medium">
              {result.domain.charAt(0).toUpperCase()}
            </span>
            <span className="text-foreground min-w-0 flex-1 truncate text-base">{result.title}</span>
            <span className={cn(mono, "text-muted-foreground shrink-0")}>{result.domain}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { collapsePanel, fieldInteractive } from "./constants.js";
import { SourceGlyph } from "./SourceGlyph.js";
import type { JSX } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { Collapsible } from "../../Collapsible.js";
import { CollapsibleContent } from "../../Collapsible.js";
import { CollapsibleTrigger } from "../../Collapsible.js";
import { mono, paper } from "./constants.js";
import { hostOf, safeHref } from "../utils/href.js";
export interface ISource {
  domain?: string | undefined;
  title: string;
  url?: string | undefined;
  snippet?: string | undefined;
  author?: string | undefined;
  publishedAt?: string | undefined;
}
export interface ISourcesProps {
  sources: readonly ISource[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout?: "grid" | "list" | undefined;
  hideTrigger?: boolean | undefined;
  locale?: string | undefined;
}
const displayDomain = (source: ISource) => source.domain || hostOf(source.url);
const formatPublishedAt = (publishedAt: string | undefined, locale: string) => {
  if (!publishedAt) return undefined;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.valueOf())) return undefined;
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
  };
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }
};
export function Sources({
  sources,
  open,
  onOpenChange,
  layout = "grid",
  hideTrigger = false,
  locale = "en-US",
}: ISourcesProps): JSX.Element {
  const badgeDomains = sources
    .map(displayDomain)
    .filter((domain): domain is string => domain !== undefined)
    .slice(0, 3);
  return (
    <Collapsible
      data-testid="Sources"
      data-slot="sources"
      data-layout={layout}
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      render={<div className={cn("w-full max-w-sm")} />}
    >
      {hideTrigger ? null : (
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className={cn(
                fieldInteractive,
                "group/trigger text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-sm outline-none",
              )}
            />
          }
        >
          {badgeDomains.length > 0 ? (
            <span aria-hidden className="flex -space-x-1">
              {badgeDomains.map((domain, index) => (
                <span
                  key={`${domain}-${index}`}
                  data-slot="sources-badge"
                  className="bg-foreground/[0.08] text-muted-foreground ring-background dark:ring-popover flex size-4 items-center justify-center rounded-full text-[8px] font-medium ring-1"
                >
                  {domain.charAt(0).toUpperCase()}
                </span>
              ))}
            </span>
          ) : null}
          <span>Sources</span>
          <span className={cn(mono, "text-muted-foreground tabular-nums")}>{sources.length}</span>
          <ChevronDownIcon aria-hidden="true" className={cn("size-4")} />
        </CollapsibleTrigger>
      )}
      <CollapsibleContent render={<div className={cn(collapsePanel, "outline-none")} />}>
        <div className={layout === "list" ? "flex flex-col pt-2.5" : "grid grid-cols-2 gap-2 pt-2.5"}>
          {sources.map((source, index) => {
            const domain = displayDomain(source);
            const href = safeHref(source.url);
            const meta = [source.author, formatPublishedAt(source.publishedAt, locale)]
              .filter((value): value is string => Boolean(value))
              .join(" · ");
            const cardClassName =
              layout === "list"
                ? "focus-visible:ring-foreground/20 hover:bg-foreground/[0.03] flex flex-col gap-1 rounded-md px-2.5 py-1.5 transition-colors duration-300 outline-none focus-visible:ring-1 focus-visible:ring-inset motion-reduce:transition-none"
                : cn(
                    paper,
                    "focus-visible:ring-foreground/20 flex flex-col gap-1.5 rounded-md p-3 transition-transform duration-150 outline-none hover:-translate-y-px focus-visible:ring-1 focus-visible:ring-inset motion-reduce:transition-none",
                  );
            const glyph = domain ? <SourceGlyph domain={domain} /> : null;
            const details = (
              <>
                {source.snippet ? (
                  <span className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{source.snippet}</span>
                ) : null}
                {meta ? <span className="text-muted-foreground truncate text-sm">{meta}</span> : null}
              </>
            );
            const content =
              layout === "list" ? (
                <>
                  <div className="flex min-w-0 items-center gap-2.5">
                    {glyph}
                    <span className="text-foreground min-w-0 flex-1 truncate text-base">{source.title}</span>
                    {domain ? (
                      <span className={cn(mono, "text-muted-foreground max-w-[40%] min-w-0 truncate")}>{domain}</span>
                    ) : null}
                  </div>
                  {source.snippet || meta ? (
                    <div className={cn("flex min-w-0 flex-col gap-1", domain && "pl-6.5")}>{details}</div>
                  ) : null}
                </>
              ) : (
                <>
                  {domain ? (
                    <div className="flex items-center gap-1.5">
                      {glyph}
                      <span className={cn(mono, "text-muted-foreground truncate")}>{domain}</span>
                    </div>
                  ) : null}
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-foreground line-clamp-2 text-base leading-snug font-medium">
                      {source.title}
                    </span>
                    {details}
                  </div>
                </>
              );
            if (href) {
              return (
                <a
                  key={`${source.url ?? source.domain ?? source.title}-${index}`}
                  data-slot="source-card"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClassName}
                >
                  {content}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              );
            }
            return (
              <div
                key={`${source.url ?? source.domain ?? source.title}-${index}`}
                data-slot="source-card"
                className={cardClassName}
              >
                {content}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

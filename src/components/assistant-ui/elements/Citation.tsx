import { AnalyticsLink } from "../../analytics/AnalyticsLink.js";
import type { ComponentProps, JSX } from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../../HoverCard.js";
import { Button } from "../../Button.js";
import { hostOf, safeHref } from "../utils/href.js";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
export interface ISource {
  domain?: string;
  title: string;
  snippet: string;
  url?: string;
  publishedAt?: string;
}
export interface ICitationProps extends Omit<ComponentProps<"button">, "aria-label" | "children" | "type"> {
  index: number;
  source: ISource;
  open?: boolean;
  onOpenChange?: ComponentProps<typeof HoverCard>["onOpenChange"];
}
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
function formatPublishedAt(publishedAt: string | undefined): string | undefined {
  if (publishedAt === undefined) return undefined;
  const date = new Date(publishedAt);
  return Number.isNaN(date.getTime()) ? undefined : dateFormatter.format(date);
}
export function Citation({ index, source, open, onOpenChange, ...props }: ICitationProps): JSX.Element {
  const domain = source.domain ?? hostOf(source.url);
  const href = safeHref(source.url);
  const publishedAt = formatPublishedAt(source.publishedAt);
  const hasMetadata = domain !== undefined || publishedAt !== undefined;
  return (
    <HoverCard open={open} onOpenChange={onOpenChange}>
      <HoverCardTrigger
        delay={0}
        render={
          <Button
            {...props}
            data-testid="Citation"
            type="button"
            variant="secondary"
            size="inline"
            aria-label={`Source ${index + 1}: ${source.title}`}
          />
        }
      >
        {index + 1}
      </HoverCardTrigger>
      <HoverCardContent side="top" sideOffset={8} data-testid="Citation--preview">
        {hasMetadata ? (
          <div className="flex items-center gap-1.5">
            {domain ? (
              <>
                <span
                  aria-hidden
                  className="bg-secondary text-muted-foreground flex size-4 items-center justify-center rounded-sm text-xs font-medium"
                >
                  {domain[0]?.toUpperCase()}
                </span>
                <span className={cn(mono, "text-muted-foreground")}>{domain}</span>
              </>
            ) : null}
            {publishedAt ? <span className={cn(mono, "text-muted-foreground")}>{publishedAt}</span> : null}
          </div>
        ) : null}
        <p className={cn("text-sm leading-snug font-medium", hasMetadata && "mt-2")}>{source.title}</p>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{source.snippet}</p>
        {href ? (
          <AnalyticsLink
            component="Citation"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground mt-2 inline-flex text-sm underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
          >
            Open source <span className="sr-only">(opens in a new tab)</span>
          </AnalyticsLink>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

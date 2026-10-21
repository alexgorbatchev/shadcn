import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { InputGroup, InputGroupInput, InputGroupAddon } from "../../InputGroup.js";
export interface ISearchHit {
  id: string;
  before: string;
  match: string;
  after: string;
  position: number;
}
export function ConversationSearch({
  query,
  hits,
  activeIndex,
  onQueryChange,
  onStep,
  ...props
}: IConversationSearchProps): JSX.Element {
  const index = hits.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), hits.length - 1);
  const active = index === -1 ? undefined : hits[index];
  return (
    <div
      data-testid="ConversationSearch"
      data-slot="conversation-search"
      className={cn("flex w-full max-w-sm gap-2")}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            readOnly={!onQueryChange}
            onChange={(event) => onQueryChange?.(event.target.value)}
            placeholder="Find in conversation"
            aria-label="Find in conversation"
          />
          <InputGroupAddon align="inline-end">
            <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
              {hits.length === 0 ? "0" : `${index + 1}/${hits.length}`}
            </span>
            {onStep && (
              <>
                <Button
                  type="button"
                  aria-label="Previous match"
                  onClick={() => onStep(-1)}
                  disabled={hits.length === 0}
                  variant="ghost"
                  size="icon"
                >
                  <ChevronUpIcon aria-hidden="true" data-icon="inline-start" />
                </Button>
                <Button
                  type="button"
                  aria-label="Next match"
                  onClick={() => onStep(1)}
                  disabled={hits.length === 0}
                  variant="ghost"
                  size="icon"
                >
                  <ChevronDownIcon aria-hidden="true" data-icon="inline-start" />
                </Button>
              </>
            )}
          </InputGroupAddon>
        </InputGroup>

        {active && (
          <div className={cn(field, "fade-in animate-in rounded-md px-3 py-2 text-sm leading-relaxed duration-200")}>
            <span className="text-muted-foreground">{active.before}</span>
            <mark className="rounded-sm bg-warning/35 px-0.5 text-foreground">{active.match}</mark>
            <span className="text-muted-foreground">{active.after}</span>
          </div>
        )}
      </div>

      <div className="bg-foreground/[0.04] inset-ring-border relative w-1.5 shrink-0 rounded-full inset-ring forced-colors:border">
        {hits.map((hit, i) => (
          <span
            key={hit.id}
            aria-hidden
            className={cn(
              "absolute inset-x-0 h-1 rounded-full transition-colors duration-200 forced-color-adjust-none",
              i === index ? "bg-warning forced-colors:bg-[Highlight]" : "bg-warning/35 forced-colors:bg-[CanvasText]",
            )}
            style={{ top: `${hit.position}%` }}
          />
        ))}
      </div>
    </div>
  );
}
interface IConversationSearchProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "query" | "hits" | "activeIndex" | "onQueryChange" | "onStep">,
  "className" | "style"
> {
  query: string;
  hits: readonly ISearchHit[];
  activeIndex: number;
  onQueryChange?: (query: string) => void;
  onStep?: (delta: number) => void;
}

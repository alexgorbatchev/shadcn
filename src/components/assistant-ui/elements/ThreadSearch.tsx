import type { KeyboardEvent } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../InputGroup.js";
import { Button } from "../../Button.js";
import type { JSX } from "react";
import { useId, useRef, type ComponentProps } from "react";
import { PinIcon, SearchIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
export interface ISearchableThread {
  id: string;
  title: string;
  group: string;
  preview: string;
  pinned?: boolean;
}
type ThreadSearchInteractionProps =
  | {
      onActiveChange: (id: string) => void;
      onSelect: (id: string) => void;
    }
  | {
      onActiveChange?: (id: string) => void;
      onSelect?: undefined;
    };
type ThreadSearchProps = Omit<
  ComponentProps<"div">,
  "children" | "threads" | "query" | "activeId" | "onQueryChange" | "onActiveChange" | "onSelect"
> & {
  threads: readonly ISearchableThread[];
  query: string;
  activeId: string;
  onQueryChange?: (query: string) => void;
  variant?: "default" | "scrollable";
} & ThreadSearchInteractionProps;
export function ThreadSearch({
  threads,
  query,
  activeId,
  onQueryChange,
  onActiveChange,
  onSelect,
  variant = "default",
  className,
  ...props
}: ThreadSearchProps): JSX.Element {
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const optionId = (id: string) => `${listId}-${id}`;
  const matches = threads.filter((thread) =>
    `${thread.title} ${thread.preview}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pinned = matches.filter((thread) => thread.pinned);
  const groups = [...new Set(matches.filter((t) => !t.pinned).map((t) => t.group))];
  const ordered = [
    ...pinned,
    ...groups.flatMap((group) => matches.filter((thread) => !thread.pinned && thread.group === group)),
  ];
  const move = (delta: number) => {
    if (ordered.length === 0 || !onActiveChange) return false;
    const at = ordered.findIndex((thread) => thread.id === activeId);
    // activeId can be filtered out by the query; start from the edge the key implies
    const from = at === -1 ? (delta > 0 ? -1 : 0) : at;
    const next = ordered[(from + delta + ordered.length) % ordered.length];
    if (!next) return false;
    onActiveChange(next.id);
    const root = listRef.current?.getRootNode();
    if (root instanceof Document || root instanceof ShadowRoot) {
      root.getElementById(optionId(next.id))?.scrollIntoView({ block: "nearest" });
    }
    return true;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if (event.key === "ArrowDown") {
      if (move(1)) event.preventDefault();
    } else if (event.key === "ArrowUp") {
      if (move(-1)) event.preventDefault();
    } else if (event.key === "Enter") {
      const active = ordered.find((thread) => thread.id === activeId);
      if (active && onSelect) {
        event.preventDefault();
        onSelect(active.id);
      }
    }
  };
  const row = (thread: ISearchableThread) => {
    const className = cn(
      "flex flex-col gap-0.5 rounded-md px-2 py-1 text-start transition-colors",
      thread.id === activeId ? "bg-foreground/[0.05]" : onSelect ? "hover:bg-foreground/[0.03]" : undefined,
    );
    const content = (
      <>
        <span className="flex items-center gap-1.5">
          {thread.pinned && <PinIcon aria-hidden="true" className={cn("size-4")} />}
          <span className="min-w-0 flex-1 truncate text-base">{thread.title}</span>
        </span>
        <span className="text-muted-foreground truncate text-sm">{thread.preview}</span>
      </>
    );
    return onSelect ? (
      <Button
        key={thread.id}
        id={optionId(thread.id)}
        type="button"
        role="option"
        tabIndex={-1}
        aria-selected={thread.id === activeId}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          onActiveChange?.(thread.id);
          onSelect(thread.id);
        }}
        variant="ghost"
        align="start"
        size="content"
        fullWidth
      >
        {content}
      </Button>
    ) : (
      <div
        key={thread.id}
        id={optionId(thread.id)}
        role="option"
        aria-selected={thread.id === activeId}
        className={className}
      >
        {content}
      </div>
    );
  };
  return (
    <div
      data-testid="ThreadSearch"
      data-slot="thread-search"
      className={cn(
        cn(
          paper,
          "flex w-full max-w-sm flex-col gap-1.5 rounded-md p-3",
          variant === "scrollable" && "max-h-48 overflow-y-auto",
        ),
        className,
      )}
      {...props}
    >
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search threads"
          aria-label="Search threads"
          role="combobox"
          aria-expanded={true}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={ordered.some((thread) => thread.id === activeId) ? optionId(activeId) : undefined}
        />
      </InputGroup>

      <div id={listId} ref={listRef} role="listbox" aria-label="Threads" className="flex flex-col gap-1.5">
        {pinned.length > 0 && (
          <div role="group" aria-label="Pinned" className="flex flex-col">
            <span aria-hidden className={cn(mono, "text-muted-foreground px-2 pb-1")}>
              pinned
            </span>
            {pinned.map(row)}
          </div>
        )}

        {groups.map((group) => (
          <div key={group} role="group" aria-label={group} className="flex flex-col">
            <span aria-hidden className={cn(mono, "text-muted-foreground px-2 pb-1")}>
              {group}
            </span>
            {matches.filter((thread) => !thread.pinned && thread.group === group).map(row)}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <span role="status" className="text-muted-foreground px-2 py-4 text-center text-sm">
          No thread matches “{query}”
        </span>
      )}
    </div>
  );
}

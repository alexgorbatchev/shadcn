import type { KeyboardEvent } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../InputGroup.js";
import { Button } from "../../Button.js";
import type { JSX } from "react";
type PromptLibraryProps = Omit<
  ComponentProps<"div">,
  "children" | "prompts" | "query" | "selectedId" | "onQueryChange" | "onSelect" | "onInsert"
> & {
  prompts: readonly ISavedPrompt[];
  query: string;
  selectedId: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (id: string) => void;
  onInsert?: (id: string) => void;
};
import { useId, type ComponentProps } from "react";
import { BookmarkIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
export interface ISavedPrompt {
  id: string;
  name: string;
  body: string;
  variables: readonly string[];
}
export function PromptLibrary({
  prompts,
  query,
  selectedId,
  onQueryChange,
  onSelect,
  onInsert,
  className,
  ...props
}: PromptLibraryProps): JSX.Element {
  const listId = useId();
  const optionId = (id: string) => `${listId}-${id}`;
  const matches = prompts.filter((prompt) => prompt.name.toLowerCase().includes(query.toLowerCase()));
  const selected = matches.find((prompt) => prompt.id === selectedId);
  const move = (delta: number) => {
    if (matches.length === 0) return;
    const at = matches.findIndex((prompt) => prompt.id === selectedId);
    // selectedId can be filtered out by the query; start from the edge the key implies
    const from = at === -1 ? (delta > 0 ? -1 : 0) : at;
    const next = matches[(from + delta + matches.length) % matches.length];
    if (next && onSelect) onSelect(next.id);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter" && selected && onInsert) {
      event.preventDefault();
      onInsert(selected.id);
    }
  };
  return (
    <div
      data-testid="PromptLibrary"
      data-slot="prompt-library"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-2 rounded-md p-3"), className)}
      {...props}
    >
      <InputGroup>
        <InputGroupAddon>
          <BookmarkIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search prompts"
          aria-label="Search saved prompts"
          role="combobox"
          aria-expanded={matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={selected ? optionId(selected.id) : undefined}
        />
      </InputGroup>

      <div id={listId} role="listbox" aria-label="Saved prompts" className="flex flex-col">
        {matches.map((prompt) => {
          const className = cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-start transition-colors",
            prompt.id === selectedId
              ? "bg-foreground/[0.05]"
              : onSelect || onInsert
                ? "hover:bg-foreground/[0.03]"
                : undefined,
          );
          const content = (
            <>
              <span className="min-w-0 flex-1 truncate text-base">{prompt.name}</span>
              {prompt.variables.length > 0 && (
                <span className={cn(mono, "text-muted-foreground shrink-0")}>
                  {`${prompt.variables.length} ${prompt.variables.length === 1 ? "var" : "vars"}`}
                </span>
              )}
            </>
          );
          return onSelect || onInsert ? (
            <Button
              key={prompt.id}
              id={optionId(prompt.id)}
              type="button"
              role="option"
              tabIndex={onSelect ? -1 : 0}
              aria-selected={prompt.id === selectedId}
              onMouseDown={onSelect ? (event) => event.preventDefault() : undefined}
              onClick={(event) => {
                if (onSelect) onSelect(prompt.id);
                else if (event.detail <= 1) onInsert?.(prompt.id);
              }}
              onDoubleClick={onSelect && onInsert ? () => onInsert(prompt.id) : undefined}
              variant="ghost"
              align="start"
              size="content"
              fullWidth
            >
              {content}
            </Button>
          ) : (
            <div
              key={prompt.id}
              id={optionId(prompt.id)}
              role="option"
              aria-selected={prompt.id === selectedId}
              className={className}
            >
              {content}
            </div>
          );
        })}
      </div>
      {matches.length === 0 && (
        <span className="text-muted-foreground block px-2 py-3 text-center text-sm break-words">
          Nothing matches “{query}”
        </span>
      )}

      {selected && (
        <div className={cn(field, "fade-in animate-in flex flex-col gap-2 rounded-md p-2.5 duration-200")}>
          <p className="text-muted-foreground text-sm leading-relaxed break-words">{selected.body}</p>
          {selected.variables.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.variables.map((variable) => (
                <span
                  key={variable}
                  className={cn(mono, "bg-background/70 text-muted-foreground rounded px-1.5 py-0.5")}
                >
                  {`{${variable}}`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

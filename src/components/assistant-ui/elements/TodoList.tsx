import { Button } from "../../Button.js";
import type { JSX } from "react";
type TodoListProps = Omit<ComponentProps<"div">, "children" | "items" | "revision" | "title"> & {
  items: readonly ITodoItem[];
  revision?: number | undefined;
  title?: string | undefined;
  description?: string | undefined;
  maxVisible?: number | undefined;
};
import { useId, useState, type ComponentProps } from "react";
import { CheckIcon, Loader2Icon, MinusIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { clamp } from "../utils/range.js";
export type TodoStatus = "pending" | "active" | "done" | "failed" | "cancelled";
export interface ITodoItem {
  id: string;
  text: string;
  status: TodoStatus;
  description?: string | undefined;
  reason?: string | undefined;
}
export function TodoList({
  items,
  revision,
  title = "Todos",
  description,
  maxVisible,
  className,
  ...props
}: TodoListProps): JSX.Element | null {
  const done = items.filter((item) => item.status === "done").length;
  const total = items.filter((item) => item.status !== "cancelled").length;
  const visibleCount = Math.floor(clamp(maxVisible ?? items.length, 0, items.length));
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const hiddenItems = items.filter(
    (item, index) => index >= visibleCount && item.status !== "active" && item.status !== "failed",
  );
  const canFold = maxVisible !== undefined && hiddenItems.length > 0;
  return (
    <div
      data-testid="TodoList"
      data-slot="todo-list"
      className={cn(cn("flex w-full max-w-sm flex-col gap-3"), className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-base font-medium">{title}</span>
          {description ? <p className="text-muted-foreground text-sm leading-4 break-words">{description}</p> : null}
        </div>
        <span className={cn(mono, "text-muted-foreground shrink-0 whitespace-nowrap tabular-nums")}>
          {revision === undefined ? `${done}/${total}` : `${done}/${total} · rev ${revision}`}
        </span>
      </div>
      <ul id={listId} className="flex flex-col gap-1">
        {items.map((item, index) => {
          const collapsed = canFold && index >= visibleCount && item.status !== "active" && item.status !== "failed";
          const rowClassName =
            "fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex items-start gap-2.5 py-0.5 text-base duration-300 motion-reduce:animate-none";
          const row = (
            <>
              <span aria-hidden className="flex size-4 h-5 shrink-0 items-center justify-center">
                {item.status === "done" ? (
                  <CheckIcon aria-hidden="true" className={cn("size-4")} />
                ) : item.status === "failed" ? (
                  <XIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
                ) : item.status === "cancelled" ? (
                  <MinusIcon aria-hidden="true" className={cn("size-4")} />
                ) : item.status === "active" ? (
                  <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
                ) : (
                  <span className="border-foreground/15 size-3.5 rounded-[5px] border" />
                )}
              </span>
              <span className="sr-only">{item.status}</span>
              <div className="min-w-0 flex-1 leading-5 break-words">
                <span
                  className={cn(
                    item.status === "done" && "text-muted-foreground line-through decoration-[1.5px]",
                    item.status === "active" && "text-foreground",
                    item.status === "pending" && "text-muted-foreground",
                    item.status === "failed" && "text-destructive text-destructive",
                    item.status === "cancelled" && "text-muted-foreground line-through decoration-[1.5px]",
                  )}
                >
                  {item.text}
                </span>
                {item.status === "failed" ? (
                  item.reason ? (
                    <p className="text-muted-foreground text-sm leading-4 break-words">{item.reason}</p>
                  ) : null
                ) : item.status !== "cancelled" && item.description ? (
                  <p className="text-muted-foreground text-sm leading-4 break-words">{item.description}</p>
                ) : null}
              </div>
            </>
          );
          if (collapsed && !expanded) return null;
          return (
            <li key={item.id} data-status={item.status} className={rowClassName}>
              {row}
            </li>
          );
        })}
      </ul>
      {canFold ? (
        <Button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((current) => !current)}
          variant="ghost"
        >
          {expanded ? "Show less" : `Show ${hiddenItems.length} more`}
        </Button>
      ) : null}
    </div>
  );
}

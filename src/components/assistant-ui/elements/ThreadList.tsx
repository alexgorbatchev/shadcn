import { Button } from "../../Button.js";
import type { JSX } from "react";
type ThreadListProps = Omit<
  ComponentProps<"div">,
  "children" | "threads" | "activeIndex" | "onActiveIndexChange" | "onRename" | "onDelete"
> & {
  threads: readonly IThreadItem[];
  activeIndex: number;
  onActiveIndexChange?: (index: number) => void;
  onRename?: (index: number) => void;
  onDelete?: (index: number) => void;
};
import type { ComponentProps } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono } from "./constants.js";
export interface IThreadItem {
  id: string;
  title: string;
  time: string;
  unread?: boolean;
}
export function ThreadList({
  threads,
  activeIndex,
  onActiveIndexChange,
  onRename,
  onDelete,
  className,
  ...props
}: ThreadListProps): JSX.Element {
  return (
    <div
      data-testid="ThreadList"
      data-slot="thread-list"
      className={cn(cn("flex w-full max-w-[240px] flex-col gap-0.5"), className)}
      {...props}
    >
      <div className={cn(mono, "text-muted-foreground px-3 pb-1.5")}>Today</div>
      {threads.map((thread, i) => {
        const active = i === activeIndex;
        const hasActions = onRename !== undefined || onDelete !== undefined;
        const hasTwoActions = onRename !== undefined && onDelete !== undefined;
        const rowClassName = cn(
          "group relative flex w-full items-center rounded-md text-base transition-colors",
          active ? field : onActiveIndexChange ? "hover:bg-foreground/[0.03]" : undefined,
        );
        const contentClassName = cn(
          "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-3 py-2 text-start",
          hasActions &&
            (onActiveIndexChange
              ? hasTwoActions
                ? "group-focus-within:pe-14 group-hover:pe-14"
                : "group-focus-within:pe-9 group-hover:pe-9"
              : hasTwoActions
                ? "pe-14"
                : "pe-9"),
        );
        const content = (
          <>
            <span className="flex-1 truncate">{thread.title}</span>
            <span
              className={cn(
                mono,
                "text-muted-foreground flex items-center gap-1.5 tabular-nums",
                hasActions && onActiveIndexChange && "group-focus-within:hidden group-hover:hidden",
              )}
            >
              {thread.unread && !active && (
                <>
                  <span aria-hidden className="size-1.5 rounded-full bg-primary bg-primary" />
                  <span className="sr-only">unread</span>
                </>
              )}
              {thread.time}
            </span>
          </>
        );
        return (
          <div key={thread.id} className={rowClassName}>
            {onActiveIndexChange ? (
              <Button
                type="button"
                aria-current={active || undefined}
                onClick={() => onActiveIndexChange(i)}
                variant="ghost"
                align="start"
                size="content"
                fullWidth
              >
                {content}
              </Button>
            ) : (
              <div aria-current={active || undefined} className={contentClassName}>
                {content}
              </div>
            )}
            {hasActions && (
              <div
                className={cn(
                  "absolute end-2 flex items-center gap-0.5",
                  onActiveIndexChange && "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
                )}
              >
                {onRename && (
                  <Button
                    type="button"
                    aria-label={`Rename ${thread.title}`}
                    onClick={() => onRename(i)}
                    variant="ghost"
                    size="icon"
                  >
                    <PencilIcon aria-hidden="true" data-icon="inline-start" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="button"
                    aria-label={`Delete ${thread.title}`}
                    onClick={() => onDelete(i)}
                    variant="ghost"
                    size="icon"
                  >
                    <Trash2Icon aria-hidden="true" data-icon="inline-start" />
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

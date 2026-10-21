import type { ReactElement } from "react";
import { useThreadListGroups } from "../hooks/useThreadListGroups.js";
import { useResolvedPortalContainer } from "../hooks/useResolvedPortalContainer.js";
import { useDensity } from "../../../hooks/useDensity.js";
import { Button } from "../../Button.js";
import { Input } from "../../Input.js";
import { Skeleton } from "../../Skeleton.js";
import { cn } from "../../../utils/cn.js";
import {
  AuiIf,
  ThreadListItemMorePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArchiveIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { forwardRef, Fragment, useEffect, useRef, useState, type ComponentPropsWithoutRef, type FC } from "react";

type ThreadListSearchContract = Omit<ComponentPropsWithoutRef<typeof Input>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
};

type ThreadListItemsProps = ComponentPropsWithoutRef<"div"> & {
  searchQuery?: string;
};

type ThreadListItemGroupsContract = {
  searchQuery?: string;
};

type ThreadListNewContract = ComponentPropsWithoutRef<typeof Button> & {
  labelClassName?: string;
};

type ThreadListItemRenameContract = {
  onDone: (restoreFocus: boolean) => void;
};

type ThreadListItemMoreContract = {
  onRename: () => void;
};

export function ThreadList(): ReactElement {
  const [search, setSearch] = useState("");
  const hasThreads = useAuiState((s) => s.threads.threadIds.length > 0);
  return (
    <ThreadListRoot>
      <ThreadListNew />
      {hasThreads && <ThreadListSearch value={search} onValueChange={setSearch} />}
      <ThreadListItems searchQuery={hasThreads ? search : ""} />
    </ThreadListRoot>
  );
}
export const ThreadListSearch = forwardRef<HTMLInputElement, ThreadListSearchContract>(function ThreadListSearch(
  { value, onValueChange, ...props },
  ref,
): ReactElement {
  return (
    <div data-slot="aui_thread-list-search" className="relative px-0.5 py-1">
      <SearchIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <Input
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-label="Search threads"
        placeholder="Search threads"
        {...props}
      />
    </div>
  );
});
ThreadListSearch.displayName = "ThreadListSearch";
export function ThreadListRoot({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ThreadListPrimitive.Root>): ReactElement {
  return (
    <ThreadListPrimitive.Root
      data-slot="aui_thread-list-root"
      {...props}
      render={<div className={cn("flex flex-col gap-0.5", className)} />}
    />
  );
}
export function ThreadListItems({ className, searchQuery = "", ...props }: ThreadListItemsProps): ReactElement {
  return (
    <div data-slot="aui_thread-list-items" className={cn("flex flex-col gap-0.5", className)} {...props}>
      <AuiIf condition={(s) => s.threads.isLoading}>
        <ThreadListSkeleton />
      </AuiIf>
      <AuiIf condition={(s) => !s.threads.isLoading}>
        <ThreadListItemGroups searchQuery={searchQuery} />
      </AuiIf>
    </div>
  );
}
const ThreadListItemGroups: FC<ThreadListItemGroupsContract> = ({ searchQuery = "" }) => {
  const { threadIds, filteredIndices, groups } = useThreadListGroups(searchQuery);
  const query = searchQuery.trim();
  if (query && filteredIndices.length === 0) {
    return (
      <div data-slot="aui_thread-list-empty" className="text-muted-foreground px-2.5 py-4 text-sm">
        No threads found
      </div>
    );
  }
  if (!groups) {
    return filteredIndices.map((index) => (
      <ThreadListPrimitive.ItemByIndex key={threadIds[index]} index={index} components={{ ThreadListItem }} />
    ));
  }
  return groups.map((group) => (
    <Fragment key={group.label}>
      <div
        data-slot="aui_thread-list-group-label"
        className="text-muted-foreground px-2.5 pt-3 pb-1 text-sm font-medium"
      >
        {group.label}
      </div>
      {group.indices.map((index) => (
        <ThreadListPrimitive.ItemByIndex key={threadIds[index]} index={index} components={{ ThreadListItem }} />
      ))}
    </Fragment>
  ));
};
export const ThreadListNew = forwardRef<HTMLButtonElement, ThreadListNewContract>(
  ({ className, labelClassName, children, ...props }, ref) => {
    return (
      <ThreadListPrimitive.New asChild>
        <Button ref={ref} variant="ghost" className={className} data-slot="aui_thread-list-new" {...props}>
          {children ?? (
            <>
              <PlusIcon aria-hidden="true" className="size-4 shrink-0" />
              <span data-slot="aui_thread-list-new-label" className={cn("whitespace-nowrap", labelClassName)}>
                New Thread
              </span>
            </>
          )}
        </Button>
      </ThreadListPrimitive.New>
    );
  },
);
ThreadListNew.displayName = "ThreadListNew";
const ThreadListSkeleton: FC = () => {
  return (
    <div role="status" aria-label="Loading threads" className="flex flex-col gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          data-slot="aui_thread-list-skeleton-wrapper"
          className="flex h-control-sm items-center px-2.5"
        >
          <Skeleton data-slot="aui_thread-list-skeleton" className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
};
export function ThreadListItem(): ReactElement {
  const isRunning = useAuiState((s) => s.threadListItem.isRunning);
  const [isRenaming, setIsRenaming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);
  useEffect(() => {
    if (isRenaming || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    triggerRef.current?.focus();
  }, [isRenaming]);
  return (
    <ThreadListItemPrimitive.Root
      data-slot="aui_thread-list-item"
      render={
        <div className="group hover:bg-muted focus-visible:bg-muted data-active:bg-muted has-focus-visible:bg-muted has-data-[state=open]:bg-muted relative flex h-control-sm items-center rounded-md transition-colors focus-visible:outline-none" />
      }
    >
      {isRenaming ? (
        <ThreadListItemRename
          onDone={(restoreFocus) => {
            restoreFocusRef.current = restoreFocus;
            setIsRenaming(false);
          }}
        />
      ) : (
        <ThreadListItemPrimitive.Trigger
          ref={triggerRef}
          data-slot="aui_thread-list-item-trigger"
          render={
            <button className="focus-visible:ring-ring/50 flex h-full min-w-0 flex-1 items-center rounded-md px-2.5 text-start text-sm outline-none group-hover:pe-9 group-has-focus-visible:pe-9 group-has-data-[state=open]:pe-9 group-data-active:pe-9 focus-visible:ring-1" />
          }
        >
          {isRunning && (
            <Loader2Icon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground animate-spin motion-reduce:animate-none"
            />
          )}
          <span data-slot="aui_thread-list-item-title" className="min-w-0 flex-1 truncate">
            <ThreadListItemPrimitive.Title fallback="New Chat" />
          </span>
          {isRunning && <span className="sr-only">Running</span>}
        </ThreadListItemPrimitive.Trigger>
      )}
      <ThreadListItemMore onRename={() => setIsRenaming(true)} />
    </ThreadListItemPrimitive.Root>
  );
}
const ThreadListItemRename: FC<ThreadListItemRenameContract> = ({ onDone }) => {
  const aui = useAui();
  const title = useAuiState((s) => s.threadListItem.title) ?? "";
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const settledRef = useRef(false);
  useEffect(() => {
    inputRef.current?.select();
  }, []);
  const commit = (restoreFocus: boolean) => {
    if (settledRef.current) return;
    settledRef.current = true;
    const next = value.trim();
    if (!next || next === title) {
      onDone(restoreFocus);
      return;
    }
    // Deferred so a synchronous throw lands on the rejection path too.
    Promise.resolve()
      .then(() => aui.threadListItem.rename(next))
      .then(
        () => onDone(restoreFocus),
        () => {
          settledRef.current = false;
          if (restoreFocus) inputRef.current?.focus();
        },
      );
  };
  const cancel = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    onDone(true);
  };
  return (
    <Input
      ref={inputRef}
      autoFocus
      data-slot="aui_thread-list-item-rename"
      aria-label="Rename thread"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => commit(false)}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
        if (event.key === "Enter") {
          event.preventDefault();
          commit(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
      }}
    />
  );
};
const ThreadListItemMore: FC<ThreadListItemMoreContract> = ({ onRename }) => {
  const { container: portalContainer, isReady: isPortalReady } = useResolvedPortalContainer();
  const density = useDensity();
  const renameRequested = useRef(false);

  return (
    <ThreadListItemMorePrimitive.Root sharedFocusGroup>
      <ThreadListItemMorePrimitive.Trigger asChild>
        <Button variant="ghost" data-slot="aui_thread-list-item-more">
          <MoreHorizontalIcon aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="sr-only">More options</span>
        </Button>
      </ThreadListItemMorePrimitive.Trigger>
      {isPortalReady && (
        <ThreadListItemMorePrimitive.Content
          onCloseAutoFocus={(event) => {
            if (!renameRequested.current) return;
            event.preventDefault();
            renameRequested.current = false;
            // Mount the editor after the menu releases its focus scope, including its exit animation.
            onRename();
          }}
          data-density={density}
          side="right"
          align="start"
          sideOffset={6}
          data-slot="aui_thread-list-item-more-content"
          asChild
          portalProps={{ container: portalContainer }}
        >
          <div className="bg-popover text-popover-foreground data-[state=open]:fade-in-0  data-[state=open]:animate-in data-[state=closed]:fade-out-0  data-[state=closed]:animate-out data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border p-1.5">
            <ThreadListItemMorePrimitive.Item
              data-slot="aui_thread-list-item-more-item"
              onSelect={() => {
                renameRequested.current = true;
              }}
              asChild
            >
              <div className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none">
                <PencilIcon aria-hidden="true" className="size-4 shrink-0" />
                Rename
              </div>
            </ThreadListItemMorePrimitive.Item>
            <ThreadListItemPrimitive.Archive asChild>
              <ThreadListItemMorePrimitive.Item data-slot="aui_thread-list-item-more-item" asChild>
                <div className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none">
                  <ArchiveIcon aria-hidden="true" className="size-4 shrink-0" />
                  Archive
                </div>
              </ThreadListItemMorePrimitive.Item>
            </ThreadListItemPrimitive.Archive>
            <ThreadListItemPrimitive.Delete asChild>
              <ThreadListItemMorePrimitive.Item data-slot="aui_thread-list-item-more-item" asChild>
                <div className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none">
                  <TrashIcon aria-hidden="true" className="size-4 shrink-0" />
                  Delete
                </div>
              </ThreadListItemMorePrimitive.Item>
            </ThreadListItemPrimitive.Delete>
          </div>
        </ThreadListItemMorePrimitive.Content>
      )}
    </ThreadListItemMorePrimitive.Root>
  );
};

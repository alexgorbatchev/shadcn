import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ItemInstance, SelectionDataRef } from "@headless-tree/core";
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import type { KeyboardEvent, MouseEvent, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../Button.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip.js";
import { useId } from "react";

type TreeItemState = {
  slot: "tree-item";
  selected: boolean;
  expanded: boolean;
  dropTarget: boolean;
  density: IDensityProps["density"];
};
type TreeItemProps<T> = useRender.ComponentProps<"div", TreeItemState> &
  IDensityProps &
  IAnalyticsProps & {
    item: ItemInstance<T>;
    startEnhancer?: ReactNode;
    endEnhancer?: ReactNode;
    expandOn?: "click" | "doubleClick" | "disclosure";
    isEditing?: boolean;
    isDropTarget?: boolean;
    /** The registered native link owns row focus; disclosure and actions remain siblings. */
    linkProps?: useRender.ComponentProps<"a", TreeItemState>;
    /** Domain-controlled drag feedback; omitted rows have no tooltip wrapper. */
    dropHint?: { content: ReactNode; open: boolean; side?: "top" | "right" | "bottom" | "left" };
  };

function isRowControl(event: MouseEvent<HTMLDivElement>): boolean {
  return (
    event.target !== event.currentTarget &&
    event.target instanceof Element &&
    Boolean(event.target.closest("a,button,input,textarea,select,form"))
  );
}

/** Registered tree row; compose menus with render and place counts/actions in endEnhancer. */
export function TreeItem<T>({
  analytics,
  item,
  children,
  startEnhancer,
  endEnhancer,
  expandOn = "click",
  isEditing = false,
  isDropTarget = false,
  linkProps,
  dropHint,
  density,
  render,
  ref,
  ...props
}: TreeItemProps<T>): ReactElement {
  const nativeProps = item.getProps();
  const hintId = useId();
  const activate = useAnalyticsCallback<[MouseEvent<HTMLElement>]>(
    "TreeItem",
    analytics,
    { name: "ui.activate" },
    undefined,
  );
  const isExpanded = item.isExpanded();
  const isSelected = item.isSelected?.() ?? false;
  const isInsideTarget = item.isUnorderedDragTarget?.() ?? false;
  const state: TreeItemState = {
    slot: "tree-item",
    selected: isSelected,
    expanded: isExpanded,
    dropTarget: isInsideTarget || isDropTarget,
    density,
  };
  const toggle = (): void => {
    if (isExpanded) item.collapse();
    else item.expand();
  };
  const select = (event: MouseEvent<HTMLDivElement>): void => {
    if (isRowControl(event)) return;
    item.setFocused();
    if (event.shiftKey) item.selectUpTo?.(event.ctrlKey || event.metaKey);
    else if (event.ctrlKey || event.metaKey) item.toggleSelect?.();
    else item.getTree().setSelectedItems?.([item.getId()]);
    if (!event.shiftKey) item.getTree().getDataRef<SelectionDataRef>().current.selectUpToAnchorId = item.getId();
    item.primaryAction();
  };
  const label = (
    <>
      <span aria-hidden="true" className="flex shrink-0 [&>svg]:size-4">
        {startEnhancer ?? (item.isFolder() ? isExpanded ? <FolderOpenIcon /> : <FolderIcon /> : <FileIcon />)}
      </span>
      <div className="min-w-0 flex-1 truncate">{children ?? item.getItemName()}</div>
    </>
  );
  const link = useRender({
    defaultTagName: "a",
    render: linkProps?.render,
    ref: [item.registerElement, linkProps?.ref ?? null],
    props: mergeProps<"a">(
      {
        ...nativeProps,
        ref: undefined,
        className: "flex min-w-0 flex-1 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        children: label,
        onFocus: () => item.setFocused(),
        onClick: (event: MouseEvent<HTMLAnchorElement>) => {
          item.setFocused();
          if (!event.ctrlKey && !event.metaKey && !event.shiftKey) item.getTree().setSelectedItems?.([item.getId()]);
          activate(event);
        },
      },
      linkProps ?? {},
    ),
    state,
  });
  const element = useRender({
    defaultTagName: "div",
    render,
    ref: [linkProps && !isEditing ? null : item.registerElement, ref ?? null],
    props: mergeProps<"div">(
      {
        ...(linkProps && !isEditing ? {} : nativeProps),
        ref: undefined,
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (
            event.target !== event.currentTarget ||
            event.defaultPrevented ||
            event.key !== "Enter" ||
            event.repeat ||
            item.getTree().getState().dnd
          )
            return;
          event.preventDefault();
          item.getTree().setSelectedItems?.([item.getId()]);
          item.primaryAction();
          if (expandOn !== "click" && item.isFolder()) toggle();
        },
        ...(!linkProps
          ? {
              onClick: (event: MouseEvent<HTMLDivElement>) => {
                if (isRowControl(event)) return;
                if (expandOn === "click") nativeProps.onClick?.(event);
                else select(event);
              },
              onDoubleClick: (event: MouseEvent<HTMLDivElement>) => {
                if (expandOn === "doubleClick" && !isRowControl(event) && item.isFolder()) toggle();
              },
            }
          : {}),
        ...(isEditing
          ? {
              draggable: false,
              onClick: undefined,
              onDoubleClick: undefined,
              onKeyDown: undefined,
              onDragStart: undefined,
            }
          : {}),
        style: { paddingInlineStart: `${item.getItemMeta().level * (item.getTree().getConfig().indent ?? 20) + 8}px` },
        className: cn(
          "relative flex min-h-control min-w-0 cursor-default items-center gap-2 rounded-sm py-1 pr-2 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
          (isSelected || isDropTarget || isInsideTarget) && "bg-accent text-accent-foreground",
        ),
        children: (
          <>
            {item.isFolder() && expandOn === "disclosure" ? (
              <Button
                variant="plain"
                size="icon-xs"
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.getItemName()}`}
                aria-expanded={isExpanded}
                onClick={(event) => {
                  event.stopPropagation();
                  toggle();
                }}
                onDoubleClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <ChevronRightIcon className={cn(isExpanded && "rotate-90")} />
              </Button>
            ) : item.isFolder() ? (
              <ChevronRightIcon aria-hidden="true" className={cn("size-3.5 shrink-0", isExpanded && "rotate-90")} />
            ) : (
              <span className={cn("shrink-0", expandOn === "disclosure" ? "size-control-xs" : "size-3.5")} />
            )}
            {linkProps && !isEditing ? link : label}
            {endEnhancer && (
              <div
                className="flex shrink-0 items-center gap-1 text-xs tabular-nums"
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {endEnhancer}
              </div>
            )}
          </>
        ),
      },
      {
        ...props,
        onClick: (event: MouseEvent<HTMLDivElement>) => {
          props.onClick?.(event);
          if (!isEditing && !isRowControl(event)) activate(event);
        },
      },
    ),
    state,
  });
  return dropHint ? (
    <Tooltip open={dropHint.open} triggerId={hintId}>
      <TooltipTrigger id={hintId} render={element} />
      <TooltipContent side={dropHint.side}>{dropHint.content}</TooltipContent>
    </Tooltip>
  ) : (
    element
  );
}
export type { TreeItemProps };

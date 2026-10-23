import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ItemInstance, SelectionDataRef } from "@headless-tree/core";
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import type { KeyboardEvent, MouseEvent, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../Button.js";

type TreeItemState = {
  slot: "tree-item";
  selected: boolean;
  expanded: boolean;
  dropTarget: boolean;
  density: IDensityProps["density"];
};
type TreeItemProps<T> = useRender.ComponentProps<"div", TreeItemState> &
  IDensityProps & {
    item: ItemInstance<T>;
    startEnhancer?: ReactNode;
    endEnhancer?: ReactNode;
    expandOn?: "click" | "doubleClick" | "disclosure";
    isEditing?: boolean;
    isDropTarget?: boolean;
  };

function isRowControl(event: MouseEvent<HTMLDivElement>): boolean {
  return (
    event.target !== event.currentTarget &&
    event.target instanceof Element &&
    Boolean(event.target.closest("button,input,textarea,select,form"))
  );
}

/** Registered tree row; compose menus with render and place counts/actions in endEnhancer. */
export function TreeItem<T>({
  item,
  children,
  startEnhancer,
  endEnhancer,
  expandOn = "click",
  isEditing = false,
  isDropTarget = false,
  density,
  render,
  ref,
  ...props
}: TreeItemProps<T>): ReactElement {
  const nativeProps = item.getProps();
  const isExpanded = item.isExpanded();
  const isSelected = item.isSelected?.() ?? false;
  const isInsideTarget = item.isUnorderedDragTarget?.() ?? false;
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
  return useRender({
    defaultTagName: "div",
    render,
    ref: [item.registerElement, ref ?? null],
    props: mergeProps<"div">(
      {
        ...nativeProps,
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
        ...(expandOn !== "click"
          ? {
              onClick: select,
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
                variant="ghost"
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
            <span aria-hidden="true" className="flex shrink-0 [&>svg]:size-4">
              {startEnhancer ?? (item.isFolder() ? isExpanded ? <FolderOpenIcon /> : <FolderIcon /> : <FileIcon />)}
            </span>
            <div className="min-w-0 flex-1 truncate">{children ?? item.getItemName()}</div>
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
      props,
    ),
    state: {
      slot: "tree-item",
      selected: isSelected,
      expanded: isExpanded,
      dropTarget: isInsideTarget || isDropTarget,
      density,
    },
  });
}
export type { TreeItemProps };

import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ItemInstance, SelectionDataRef } from "@headless-tree/core";
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import type { ComponentProps, FocusEvent, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../Button.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip.js";
import { use, useId } from "react";
import { TreeTabStopContext } from "./TreeTabStopContext.js";

type TreeItemState = {
  slot: "tree-item";
  selected: boolean;
  expanded: boolean;
  dropTarget: boolean;
  dimmed: boolean;
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
    /** Fades a settled row, such as completed work, to 70% opacity; hover and keyboard focus restore full opacity. */
    isDimmed?: boolean;
    /** The registered native link owns row focus; disclosure and actions remain siblings. */
    linkProps?: useRender.ComponentProps<"a", TreeItemState>;
    /** Domain-controlled drag feedback; omitted rows have no tooltip wrapper. */
    dropHint?: { content: ReactNode; open: boolean; side?: "top" | "right" | "bottom" | "left" };
    /**
     * Secondary text at the row's end, such as a count. It is the item's accessible description, never part of its
     * name, so names stay stable for typeahead, drag announcements and tests.
     */
    description?: ReactNode;
    /** Spoken description when the visible `description` is terse, such as "12 tracks" for "12". */
    descriptionLabel?: string;
    /**
     * Pointer shortcuts at the row's end, such as a ⋯ menu trigger, each rendered as a `TreeItemAction`. A tree is one
     * Tab stop whose items carry their own keys (arrows, Enter, Shift+F10 and the Menu key), so actions stay out of the
     * Tab order and the accessibility tree, and the tree owns only tree items.
     */
    actions?: ReactNode;
  };

type TreeItemActionProps = ComponentProps<typeof Button>;

/**
 * A row's pointer shortcut for a command its item also offers through keys. It is never a Tab stop, including when a
 * menu trigger renders it, so the tree keeps one Tab stop.
 */
export function TreeItemAction({ variant = "ghost", size = "icon-xs", ...props }: TreeItemActionProps): ReactElement {
  return <Button variant={variant} size={size} {...props} tabIndex={-1} />;
}

function isRowControl(event: MouseEvent<HTMLDivElement>): boolean {
  return (
    event.target !== event.currentTarget &&
    event.target instanceof Element &&
    Boolean(event.target.closest("a,button,input,textarea,select,form"))
  );
}

/**
 * Registered tree row; compose menus with render, put counts in `description` and pointer shortcuts in `actions`.
 * `endEnhancer` holds controls that must stay keyboard reachable on their own.
 */
export function TreeItem<T>({
  analytics,
  item,
  children,
  startEnhancer,
  endEnhancer,
  description,
  descriptionLabel,
  actions,
  expandOn = "click",
  isEditing = false,
  isDropTarget = false,
  isDimmed = false,
  linkProps,
  dropHint,
  density,
  render,
  ref,
  ...props
}: TreeItemProps<T>): ReactElement {
  const tabStop = use(TreeTabStopContext);
  const descriptionId = useId();
  const hasDescription = (description !== undefined && description !== null) || Boolean(descriptionLabel);
  const registered = item.getProps();
  const nativeProps: typeof registered = {
    ...registered,
    // One Tab stop per tree, even while a collapsed ancestor or a filter hides the focused item.
    ...(tabStop === undefined ? {} : { tabIndex: item.getId() === tabStop ? 0 : -1 }),
    // The name is the visible label (Label in Name): icons, the disclosure, the description and actions are hidden
    // from it. An endEnhancer's text and an editor sit inside the row, so those rows keep the item name as a label.
    "aria-label": endEnhancer || isEditing ? registered["aria-label"] : undefined,
    "aria-describedby": hasDescription ? descriptionId : undefined,
  };
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
    dimmed: isDimmed,
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
        // Tab lands on the tab stop, which then becomes the focused item that the arrow keys move from.
        onFocus: (event: FocusEvent<HTMLDivElement>) => {
          if (event.target === event.currentTarget && item.getTree().getState().focusedItem !== item.getId())
            item.setFocused();
        },
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
          isDimmed && "opacity-70 focus-within:opacity-100 hover:opacity-100",
        ),
        children: (
          <>
            {item.isFolder() && expandOn === "disclosure" ? (
              // A pointer target only: the item states aria-expanded and toggles with the arrow keys, so the button stays
              // out of the Tab order and the accessibility tree, and a click leaves focus where it was.
              <Button
                variant="plain"
                size="icon-xs"
                tabIndex={-1}
                aria-hidden="true"
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.getItemName()}`}
                onMouseDown={(event) => event.preventDefault()}
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
            {(hasDescription || actions) && (
              <div className="flex shrink-0 items-center gap-1 text-xs tabular-nums">
                {/* Hidden from the item's content; `aria-describedby` still reads a hidden element it names. */}
                {description !== undefined && description !== null && (
                  <span
                    aria-hidden="true"
                    id={descriptionLabel ? undefined : descriptionId}
                    data-slot="tree-item-description"
                  >
                    {description}
                  </span>
                )}
                {descriptionLabel && (
                  <span id={descriptionId} hidden>
                    {descriptionLabel}
                  </span>
                )}
                {actions && (
                  <div
                    aria-hidden="true"
                    data-slot="tree-item-actions"
                    className="flex items-center gap-1"
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    {actions}
                  </div>
                )}
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

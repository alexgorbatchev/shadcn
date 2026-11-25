import type { IAnalyticsProps } from "../../analytics/types.js";
import { StatusDot } from "../StatusDot.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ItemInstance, SelectionDataRef } from "@headless-tree/core";
import {
  ChevronRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDotIcon,
  CircleIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  HourglassIcon,
} from "lucide-react";
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
    /**
     * Whether the row shows its kind icon (folder or file) before the label. `false` drops it and its gap, so the label
     * starts where the icon was; a tree whose disclosure already tells folders from leaves needs no icon.
     */
    hasIcon?: boolean;
    /**
     * Calls attention to the row with the `warning` tone: a 2 px warning bar on its leading edge and a warning-coloured
     * start icon, such as a lightning bolt for something live. The row takes no fill, so fills keep meaning selection, and
     * a selected row keeps the selection background with the bar. Pair it with words in `descriptionLabel`, so the meaning
     * never rests on colour.
     */
    tone?: "default" | "warning";
    /** Selected row highlight: `subtle` uses the neutral accent fill; `accent` adds a primary border for pickers. */
    selectionStyle?: "subtle" | "accent";
    endEnhancer?: ReactNode;
    expandOn?: "click" | "doubleClick" | "disclosure";
    isEditing?: boolean;
    isDropTarget?: boolean;
    /**
     * Fades a settled row, such as completed work, to 70% opacity; hover and keyboard focus restore full opacity. The
     * `marker` and the `endEnhancer`'s tags stay at full opacity, so new activity on a settled row stands out without
     * un-fading it, and muted tag text keeps 4.5:1.
     */
    isDimmed?: boolean;
    /** Marks a row with activity its reader has not seen yet: the label turns bold. Pair it with a `marker`. */
    isUnread?: boolean;
    /**
     * The row's start slot, before its icon and label and outside its link: a status control (a `TreeItemAction`
     * holding a `TreeItemStatusIcon`) or a plain status icon. `null` keeps the slot empty so rows stay aligned. It
     * fades with the row.
     */
    leading?: ReactNode;
    /**
     * A visual marker at the row's end, such as a `TreeItemDot` for new activity, never faded by `isDimmed`. It is
     * hidden from assistive technology; state what it means in `descriptionLabel`.
     */
    marker?: ReactNode;
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

/**
 * A row's hand-back state, drawn by `TreeItemStatusIcon`: two waiting states, waiting with unsent answers, failed,
 * held for an Undo window, handed back, and handed back with unsent changes.
 */
export type TreeItemStatus =
  | "needs-answers"
  | "needs-review"
  | "unsent"
  | "failed"
  | "held"
  | "handed-back"
  | "handed-back-unsent";

const STATUS_ICONS: Record<TreeItemStatus, typeof CircleIcon> = {
  "needs-answers": CircleDotIcon,
  "needs-review": CircleIcon,
  unsent: CircleIcon,
  failed: CircleAlertIcon,
  held: HourglassIcon,
  "handed-back": CircleCheckIcon,
  "handed-back-unsent": CircleCheckIcon,
};

interface ITreeItemStatusIconProps {
  status: TreeItemStatus;
  className?: string;
}

/**
 * The status icon set for a row's `leading` slot. Each state has its own shape, so forced colors keep them apart; the
 * unsent states add a filled marker at the top end. It is decorative: the row's `descriptionLabel` names the state.
 */
export function TreeItemStatusIcon({ status, className }: ITreeItemStatusIconProps): ReactElement {
  const Icon = STATUS_ICONS[status];
  const hasMarker = status === "unsent" || status === "handed-back-unsent";
  return (
    <span
      aria-hidden="true"
      data-slot="tree-item-status"
      data-status={status}
      className={cn("relative inline-flex size-4 shrink-0 items-center justify-center", className)}
    >
      <Icon className="size-3.5" />
      {hasMarker && (
        // The marker sits in its own box, so the icon's size never applies to it.
        <span data-slot="tree-item-status-marker" className="absolute -top-0.5 -right-0.5 flex size-1.5">
          <svg viewBox="0 0 6 6" className="size-full" focusable="false">
            <circle cx="3" cy="3" r="3" fill="currentColor" />
          </svg>
        </span>
      )}
    </span>
  );
}

interface ITreeItemDotProps {
  /** The number shown beside the dot, such as the new pages inside a collapsed folder; omitted for a single item. */
  count?: number;
  className?: string;
}

/**
 * The new-activity dot for a `TreeItem`'s `marker`, with an optional count for a collapsed container that rolls up its
 * rows. Drawn as an SVG fill in `currentColor`, so forced colors keep it visible. It is decorative: the row's
 * `descriptionLabel` names it ("New round", "1 new page").
 */
export function TreeItemDot({ count, className }: ITreeItemDotProps): ReactElement {
  return <StatusDot data-slot="tree-item-dot" count={count} className={className} />;
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
  isUnread = false,
  hasIcon = true,
  tone = "default",
  selectionStyle = "subtle",
  leading,
  marker,
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
  // A dimmed row fades its content rather than itself, so the marker can stay at full opacity; hovering or focusing a
  // choosable dimmed row restores the content, while an aria-disabled row stays dimmed so it never looks active.
  const isAriaDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const faded =
    isDimmed &&
    (isAriaDisabled
      ? "opacity-70"
      : "opacity-70 group-hover/tree-item:opacity-100 group-focus-within/tree-item:opacity-100");
  const label = (
    <>
      {(hasIcon || startEnhancer) && (
        <span aria-hidden="true" className={cn("flex shrink-0 [&>svg]:size-4", tone === "warning" && "text-warning")}>
          {startEnhancer ?? (item.isFolder() ? isExpanded ? <FolderOpenIcon /> : <FolderIcon /> : <FileIcon />)}
        </span>
      )}
      <div className={cn("min-w-0 flex-1 truncate", isUnread && "font-semibold")}>{children ?? item.getItemName()}</div>
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
        className: cn(
          "flex min-w-0 flex-1 items-center gap-2 self-stretch -my-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          faded,
        ),
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
          "relative flex min-h-control min-w-0 cursor-default items-center gap-2 rounded-sm border border-transparent py-1 pr-2 text-sm outline-none",
          isAriaDisabled
            ? "focus-visible:ring-1 focus-visible:ring-muted-foreground"
            : "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
          (isSelected || isDropTarget || isInsideTarget) &&
            (selectionStyle === "accent" && isSelected
              ? "border-primary bg-muted/60 font-medium text-foreground"
              : "bg-accent text-accent-foreground"),
          tone === "warning" &&
            "before:pointer-events-none before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full before:bg-warning",
          isDimmed && "group/tree-item",
        ),
        children: (
          <>
            {item.isFolder() && expandOn === "disclosure" ? (
              // A pointer target only: the item states aria-expanded and toggles with the arrow keys, so the button stays
              // out of the Tab order and the accessibility tree, and a click leaves focus where it was.
              <Button
                variant="plain"
                size="icon-xs"
                className={cn(faded)}
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
              <ChevronRightIcon
                aria-hidden="true"
                className={cn("size-3.5 shrink-0", isExpanded && "rotate-90", faded)}
              />
            ) : (
              <span className={cn("shrink-0", expandOn === "disclosure" ? "size-control-xs" : "size-3.5")} />
            )}
            {leading !== undefined && (
              <div
                data-slot="tree-item-leading"
                className={cn("flex size-control-xs shrink-0 items-center justify-center", faded)}
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {leading}
              </div>
            )}
            {linkProps && !isEditing ? (
              link
            ) : isDimmed ? (
              <div className={cn("flex min-w-0 flex-1 items-center gap-2", faded)}>{label}</div>
            ) : (
              label
            )}
            {/* The end slot keeps full opacity on a dimmed row: its tags and counts are already muted, and fading them
                again would take their text below 4.5:1. */}
            {endEnhancer && (
              <div
                data-slot="tree-item-end"
                className="flex shrink-0 items-center gap-1 text-xs tabular-nums"
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {endEnhancer}
              </div>
            )}
            {marker !== undefined && marker !== null && marker !== false && (
              <div aria-hidden="true" data-slot="tree-item-marker" className="flex shrink-0 items-center">
                {marker}
              </div>
            )}
            {/* The spoken description sits outside the trailing slot, so a row with nothing visible after its marker or
                tags adds no gap there and every row's trailing markers share one right edge. Hidden from the item's
                content; `aria-describedby` still reads a hidden element it names. */}
            {descriptionLabel && (
              <span id={descriptionId} hidden>
                {descriptionLabel}
              </span>
            )}
            {((description !== undefined && description !== null) || actions) && (
              <div className={cn("flex shrink-0 items-center gap-1 text-xs tabular-nums", faded)}>
                {description !== undefined && description !== null && (
                  <span
                    aria-hidden="true"
                    id={descriptionLabel ? undefined : descriptionId}
                    data-slot="tree-item-description"
                  >
                    {description}
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

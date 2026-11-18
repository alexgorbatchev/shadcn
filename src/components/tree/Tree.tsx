import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalytics } from "../../hooks/useAnalytics.js";
import type { TreeInstance, ItemInstance } from "@headless-tree/core";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { TreeItem } from "./TreeItem.js";
import { TreeTabStopContext } from "./TreeTabStopContext.js";

/**
 * The item that Tab reaches: the focused item while it is visible, else the first selected visible item, else the first
 * item. A collapsed ancestor or a filter can hide the focused item, and the tree must still keep exactly one Tab stop.
 */
function tabStopId<T>(items: ItemInstance<T>[], focusedId: string | null | undefined): string | undefined {
  const focused = focusedId == null ? undefined : items.find((item) => item.getId() === focusedId);
  return (focused ?? items.find((item) => item.isSelected?.()) ?? items.at(0))?.getId();
}

type TreeProps<T> = IAnalyticsProps &
  IDensityProps & {
    tree: TreeInstance<T>;
    label: string;
    variant?: "default" | "sidebar";
    renderIcon?: (item: ItemInstance<T>) => ReactNode;
    renderLabel?: (item: ItemInstance<T>) => ReactNode;
    renderItem?: (item: ItemInstance<T>) => ReactNode;
  };

/**
 * Headless Tree owns navigation, selection, expansion, and optional pointer/keyboard drag and drop. The tree is one Tab
 * stop: arrows move between items, and row controls stay out of the Tab order.
 */
function Tree<T>({
  analytics,
  tree,
  label,
  variant = "default",
  renderIcon,
  renderLabel,
  renderItem,
  density,
}: TreeProps<T>): ReactElement {
  const track = useAnalytics("Tree", analytics);
  const container = tree.getContainerProps(label);
  const dragLine = tree.getDragLineData?.();
  const element = tree.getElement();
  const items = tree.getItems();
  return (
    <TreeTabStopContext value={tabStopId(items, tree.getState().focusedItem)}>
      <div
        {...container}
        data-density={density}
        className={cn(
          "grid min-w-0 grid-cols-1 gap-1",
          variant === "default" && "rounded-sm border border-border bg-card p-2",
        )}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.target instanceof Element && event.target.closest("input,textarea,select,form,button,[role=menu]"))
            return;
          if (event.defaultPrevented) return;
          container.onKeyDown?.(event);
          if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "].includes(event.key)) {
            track({ name: "ui.navigate" }, event.nativeEvent);
          }
        }}
      >
        {items.map((item) =>
          renderItem ? (
            <div key={item.getKey()} role="none">
              {renderItem(item)}
            </div>
          ) : (
            <TreeItem key={item.getKey()} item={item} startEnhancer={renderIcon?.(item)} density={density}>
              {renderLabel?.(item)}
            </TreeItem>
          ),
        )}
        {dragLine && (
          <span
            data-slot="tree-drop-indicator"
            aria-hidden="true"
            className="pointer-events-none absolute h-0.5 bg-primary"
            style={tree.getDragLineStyle(-1 - (element?.clientTop ?? 0), -(element?.clientLeft ?? 0))}
          />
        )}
      </div>
    </TreeTabStopContext>
  );
}
export { Tree };
export type { TreeProps };

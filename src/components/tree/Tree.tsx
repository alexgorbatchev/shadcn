import type { TreeInstance, ItemInstance } from "@headless-tree/core";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { TreeItem } from "./TreeItem.js";

type TreeProps<T> = IDensityProps & {
  tree: TreeInstance<T>;
  label: string;
  variant?: "default" | "sidebar";
  renderIcon?: (item: ItemInstance<T>) => ReactNode;
  renderLabel?: (item: ItemInstance<T>) => ReactNode;
  renderItem?: (item: ItemInstance<T>) => ReactNode;
};

/** Headless Tree owns navigation, selection, expansion, and optional pointer/keyboard drag and drop. */
function Tree<T>({
  tree,
  label,
  variant = "default",
  renderIcon,
  renderLabel,
  renderItem,
  density,
}: TreeProps<T>): ReactElement {
  const container = tree.getContainerProps(label);
  const dragLine = tree.getDragLineData?.();
  const element = tree.getElement();
  return (
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
        container.onKeyDown?.(event);
      }}
    >
      {tree.getItems().map((item) =>
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
  );
}
export { Tree };
export type { TreeProps };

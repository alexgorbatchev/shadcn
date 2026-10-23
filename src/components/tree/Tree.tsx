import type { TreeInstance, ItemInstance } from "@headless-tree/core";
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";

type TreeProps<T> = IDensityProps & {
  tree: TreeInstance<T>;
  label: string;
  renderIcon?: (item: ItemInstance<T>) => ReactNode;
  renderLabel?: (item: ItemInstance<T>) => ReactNode;
};
/** Render a native Headless Tree instance; configure loading, selection, and actions with useTree. */
function Tree<T>({ tree, label, renderIcon, renderLabel, density }: TreeProps<T>): ReactElement {
  return (
    <div
      {...tree.getContainerProps(label)}
      data-density={density}
      className="grid gap-1 rounded-sm border border-border bg-card p-2"
    >
      {tree.getItems().map((item) => (
        <div
          {...item.getProps()}
          key={item.getKey()}
          style={{ paddingInlineStart: `${item.getItemMeta().level * 20 + 8}px` }}
          className={cn(
            "flex min-h-control cursor-default items-center gap-2 rounded-sm py-1 pr-2 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
            tree.getState().selectedItems?.includes(item.getId()) && "bg-accent text-accent-foreground",
          )}
        >
          {item.isFolder() ? (
            <ChevronRightIcon
              aria-hidden="true"
              className={cn("size-3.5 shrink-0", item.isExpanded() && "rotate-90")}
            />
          ) : (
            <span className="size-3.5 shrink-0" />
          )}
          <span aria-hidden="true" className="flex shrink-0 [&>svg]:size-4">
            {renderIcon ? (
              renderIcon(item)
            ) : item.isFolder() ? (
              item.isExpanded() ? (
                <FolderOpenIcon />
              ) : (
                <FolderIcon />
              )
            ) : (
              <FileIcon />
            )}
          </span>
          <span className="min-w-0 truncate">{renderLabel ? renderLabel(item) : item.getItemName()}</span>
        </div>
      ))}
    </div>
  );
}
export { Tree };
export type { TreeProps };
export { useTree, AssistiveTreeDescription } from "@headless-tree/react";
export {
  syncDataLoaderFeature,
  asyncDataLoaderFeature,
  hotkeysCoreFeature,
  selectionFeature,
  checkboxesFeature,
  searchFeature,
  renamingFeature,
  expandAllFeature,
} from "@headless-tree/core";
export type { TreeInstance, ItemInstance, TreeConfig } from "@headless-tree/core";

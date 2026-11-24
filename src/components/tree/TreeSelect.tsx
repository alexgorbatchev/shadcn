import { useEffect, useId, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { hotkeysCoreFeature, selectionFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Input } from "../Input.js";
import { Tree } from "./Tree.js";
import { TreeItem } from "./TreeItem.js";

/** A place a `TreeSelect` offers, with the places inside it. */
export interface ITreeSelectNode {
  id: string;
  label: string;
  children?: readonly ITreeSelectNode[] | undefined;
  /** Why this place cannot be chosen, such as "Archived": it stays listed, reachable and described, but not choosable. */
  disabledReason?: string | undefined;
}

export interface ITreeSelectProps {
  nodes: readonly ITreeSelectNode[];
  /** The chosen node's id, or null while nothing is chosen. */
  value: string | null;
  /** Called with a node chosen by click, Enter or Space; nodes with a `disabledReason` are never chosen. */
  onValueChange: (id: string) => void;
  /** Names the tree, such as "Destination". */
  label: string;
  /** Names the filter field; defaults to "Filter". */
  filterLabel?: string | undefined;
  filterPlaceholder?: string | undefined;
  /** The node where the item sits now, marked with `currentLabel`. */
  currentId?: string | undefined;
  /** Defaults to "Current location". */
  currentLabel?: string | undefined;
  /** Shown when the filter matches nothing; defaults to "No matches". */
  emptyLabel?: string | undefined;
  isDisabled?: boolean | undefined;
}

const ROOT_ID = "tree-select-root";

interface IIndexedNode {
  node: ITreeSelectNode;
  parentId: string;
}

function indexNodes(nodes: readonly ITreeSelectNode[], parentId: string, index: Map<string, IIndexedNode>): void {
  for (const node of nodes) {
    index.set(node.id, { node, parentId });
    indexNodes(node.children ?? [], node.id, index);
  }
}

/** The ids a filter leaves visible: every node whose label matches, with its ancestors for context. */
function getVisibleIds(index: ReadonlyMap<string, IIndexedNode>, filter: string): Set<string> {
  const query = filter.trim().toLocaleLowerCase();
  const visible = new Set<string>();
  for (const [id, { node }] of index) {
    if (query && !node.label.toLocaleLowerCase().includes(query)) continue;
    let current: string | undefined = id;
    while (current && current !== ROOT_ID && !visible.has(current)) {
      visible.add(current);
      current = index.get(current)?.parentId;
    }
  }
  return visible;
}

/**
 * Chooses one place in a hierarchy, such as a destination folder: a filter that matches any node's name and keeps its
 * ancestors in view, above a tree that is one Tab stop. ↓ in the filter enters the tree; arrows move and expand; Enter,
 * Space or a click chooses. The current place carries `currentLabel`, and places that cannot be chosen stay listed with
 * their reason as the row's description.
 */
export function TreeSelect({
  nodes,
  value,
  onValueChange,
  label,
  filterLabel = "Filter",
  filterPlaceholder,
  currentId,
  currentLabel = "Current location",
  emptyLabel = "No matches",
  isDisabled = false,
}: ITreeSelectProps): ReactElement {
  const filterId = useId();
  const [filter, setFilter] = useState("");
  const index = useMemo(() => {
    const result = new Map<string, IIndexedNode>();
    indexNodes(nodes, ROOT_ID, result);
    return result;
  }, [nodes]);
  const visible = useMemo(() => getVisibleIds(index, filter), [index, filter]);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());
  const getChildren = (id: string): string[] =>
    (id === ROOT_ID ? nodes : (index.get(id)?.node.children ?? []))
      .map((child) => child.id)
      .filter((child) => visible.has(child));
  // Every place shows open, so the whole hierarchy reads at once; a filter reopens what it matches inside.
  const parents = useMemo(
    () => [...index.values()].filter(({ node }) => (node.children?.length ?? 0) > 0).map(({ node }) => node.id),
    [index],
  );
  const isFiltering = filter.trim() !== "";
  // The tree compares its state by identity on every render, so each array changes only when its contents do.
  const expandedItems = useMemo(
    () => parents.filter((id) => isFiltering || !collapsed.has(id)),
    [parents, isFiltering, collapsed],
  );
  const selectedItems = useMemo(() => (value ? [value] : []), [value]);
  const choose = (id: string) => {
    if (isDisabled || index.get(id)?.node.disabledReason) return;
    onValueChange(id);
  };
  const tree = useTree<ITreeSelectNode>({
    rootItemId: ROOT_ID,
    getItemName: (item) => item.getItemData().label,
    isItemFolder: (item) => getChildren(item.getId()).length > 0,
    dataLoader: {
      getItem: (id) => index.get(id)?.node ?? { id: ROOT_ID, label },
      getChildren,
    },
    initialState: { focusedItem: value },
    state: { expandedItems, selectedItems },
    setExpandedItems: (next) => {
      const expanded = typeof next === "function" ? next(expandedItems) : next;
      const nextCollapsed = parents.filter((id) => !expanded.includes(id));
      if (nextCollapsed.length !== collapsed.size || nextCollapsed.some((id) => !collapsed.has(id)))
        setCollapsed(new Set(nextCollapsed));
    },
    setSelectedItems: () => undefined,
    onPrimaryAction: (item) => choose(item.getId()),
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  const visibleKey = [...visible].join("\n");
  useEffect(() => {
    tree.rebuildTree();
  }, [tree, visibleKey]);
  const hasItems = visible.size > 0;
  return (
    <div data-testid="TreeSelect" data-slot="tree-select" className="flex min-w-0 flex-col gap-2">
      <Input
        id={filterId}
        type="search"
        aria-label={filterLabel}
        placeholder={filterPlaceholder}
        value={filter}
        disabled={isDisabled}
        autoComplete="off"
        onChange={(event) => setFilter(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          const target =
            tree.getItems().find((item) => item.getId() === tree.getState().focusedItem) ?? tree.getItems().at(0);
          if (!target) return;
          event.preventDefault();
          target.setFocused();
          target.getElement()?.focus();
        }}
      />
      {hasItems ? (
        <Tree
          tree={tree}
          label={label}
          renderItem={(item) => {
            const node = item.getItemData();
            const description = node.disabledReason ?? (node.id === currentId ? currentLabel : undefined);
            return (
              <TreeItem
                item={item}
                expandOn="disclosure"
                hasIcon={false}
                description={description}
                isDimmed={Boolean(node.disabledReason)}
                aria-disabled={node.disabledReason || isDisabled ? true : undefined}
                data-current={node.id === currentId ? "" : undefined}
                onKeyDown={(event) => {
                  if (event.key !== " ") return;
                  event.preventDefault();
                  choose(item.getId());
                }}
              />
            );
          }}
        />
      ) : (
        <p role="status" className="px-2 py-3 text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

import axe from "axe-core";
import type { ReactElement } from "react";
import { assert, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Button } from "../Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../DropdownMenu";
import { ThemeProvider } from "../ThemeProvider";
import {
  Tree,
  TreeItem,
  TreeItemAction,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  useTree,
} from "../tree";
import "../../../.storybook/preview.css";

interface IEntry {
  name: string;
  count?: number;
  children?: string[];
}

const ENTRIES: Record<string, IEntry> = {
  root: { name: "Root", children: ["library"] },
  library: { name: "Main library", count: 236, children: ["sets", "loose"] },
  sets: { name: "Sets", count: 0, children: ["warmup", "late"] },
  warmup: { name: "Warm up", count: 2 },
  late: { name: "Late", count: 3 },
  loose: { name: "Loose", count: 3 },
};

/** A sidebar-like tree: a linked library row, folders with disclosures, counts and a ⋯ action on every row. */
function SidebarTree(): ReactElement {
  const tree = useTree<IEntry>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().children),
    dataLoader: { getItem: (id) => ENTRIES[id]!, getChildren: (id) => ENTRIES[id]?.children ?? [] },
    initialState: { expandedItems: ["library", "sets"], selectedItems: ["warmup"] },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <ThemeProvider forcedTheme="light">
      <Button>Before</Button>
      <div className="w-80">
        <Tree
          tree={tree}
          label="Libraries and playlists"
          variant="sidebar"
          renderItem={(item) => {
            const { name, count } = item.getItemData();
            return (
              <TreeItem
                item={item}
                expandOn="disclosure"
                linkProps={
                  item.getId() === "library"
                    ? { href: "#library", onClick: (event) => event.preventDefault() }
                    : undefined
                }
                description={count}
                descriptionLabel={count === undefined ? undefined : `${count} tracks`}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<TreeItemAction aria-label={`Actions for ${name}`} />}>
                      …
                    </DropdownMenuTrigger>
                    <DropdownMenuContent aria-label={`Actions for ${name}`}>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            );
          }}
        />
      </div>
      <Button>After</Button>
    </ThemeProvider>
  );
}

function treeElement(): HTMLElement {
  const element = page.getByRole("tree", { name: "Libraries and playlists" }).element();
  assert.instanceOf(element, HTMLElement);
  return element;
}

/** Every element inside the tree that Tab can reach. */
function tabStops(): Element[] {
  return [...treeElement().querySelectorAll("a[href], button, input, [tabindex]")].filter(
    (element) => element instanceof HTMLElement && element.tabIndex >= 0,
  );
}

test("the tree is one Tab stop: Tab enters on the selected item and the next Tab leaves the tree", async () => {
  await render(<SidebarTree />);
  await expect.element(page.getByRole("treeitem", { name: "Warm up" })).toBeVisible();
  await expect.poll(tabStops).toEqual([page.getByRole("treeitem", { name: "Warm up" }).element()]);
  await userEvent.click(page.getByRole("button", { name: "Before" }));
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("treeitem", { name: "Warm up" })).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "After" })).toHaveFocus();
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await expect.element(page.getByRole("treeitem", { name: "Warm up" })).toHaveFocus();
});

test("arrow keys move focus through the items and carry the Tab stop with them", async () => {
  await render(<SidebarTree />);
  await userEvent.click(page.getByRole("button", { name: "Before" }));
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("treeitem", { name: "Warm up" })).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("treeitem", { name: "Late" })).toHaveFocus();
  await userEvent.keyboard("{ArrowUp}{ArrowUp}");
  await expect.element(page.getByRole("treeitem", { name: "Sets" })).toHaveFocus();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(page.getByRole("treeitem", { name: "Sets" })).toHaveAttribute("aria-expanded", "false");
  await expect.element(page.getByRole("treeitem", { name: "Warm up" })).not.toBeInTheDocument();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(page.getByRole("treeitem", { name: "Sets" })).toHaveAttribute("aria-expanded", "true");
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(page.getByRole("treeitem", { name: "Main library" })).toHaveFocus();
  await expect.poll(tabStops).toEqual([page.getByRole("treeitem", { name: "Main library" }).element()]);
  // Leaving and returning lands on the item the arrows reached, not on the selected one.
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "After" })).toHaveFocus();
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await expect.element(page.getByRole("treeitem", { name: "Main library" })).toHaveFocus();
});

test("collapsing the focused item's folder by pointer leaves one Tab stop, and the disclosure takes no focus", async () => {
  await render(<SidebarTree />);
  await userEvent.click(page.getByRole("treeitem", { name: "Late" }));
  await expect.element(page.getByRole("treeitem", { name: "Late" })).toHaveFocus();
  const collapse = page.getByRole("button", { name: "Collapse Sets", includeHidden: true });
  await expect.element(collapse).toHaveAttribute("aria-hidden", "true");
  await expect.element(collapse).toHaveAttribute("tabindex", "-1");
  await userEvent.click(collapse);
  await expect.element(page.getByRole("treeitem", { name: "Sets" })).toHaveAttribute("aria-expanded", "false");
  await expect.poll(tabStops).toEqual([page.getByRole("treeitem", { name: "Main library" }).element()]);
  await userEvent.click(page.getByRole("button", { name: "Before" }));
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("treeitem", { name: "Main library" })).toHaveFocus();
});

test("items are named without their counts, describe them, and the tree passes axe", async () => {
  await render(<SidebarTree />);
  const warmup = page.getByRole("treeitem", { name: "Warm up", exact: true });
  await expect.element(warmup).toBeVisible();
  await expect.element(warmup).toHaveAccessibleName("Warm up");
  await expect.element(warmup).toHaveAccessibleDescription("2 tracks");
  await expect.element(warmup).toHaveAttribute("aria-level", "3");
  await expect.element(page.getByRole("treeitem", { name: "Main library" })).toHaveAccessibleDescription("236 tracks");
  await expect.element(page.getByRole("treeitem", { name: "Main library" })).toHaveAttribute("aria-level", "1");
  await expect.element(page.getByRole("treeitem", { name: "Sets" })).toHaveAttribute("aria-level", "2");
  // Row actions and disclosures are pointer targets: neither the tree's content nor Tab stops.
  await expect.element(page.getByRole("button", { name: "Actions for Warm up" })).not.toBeInTheDocument();
  await expect
    .element(page.getByRole("button", { name: "Actions for Warm up", includeHidden: true }))
    .toHaveAttribute("tabindex", "-1");
  const result = await axe.run(treeElement());
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
  expect(result.passes.map(({ id }) => id)).toEqual(
    expect.arrayContaining(["aria-required-children", "aria-required-parent", "aria-hidden-focus"]),
  );
});

test("a row action still opens its menu by pointer", async () => {
  await render(<SidebarTree />);
  await userEvent.click(page.getByRole("button", { name: "Actions for Late", includeHidden: true }));
  await expect.element(page.getByRole("menu", { name: "Actions for Late" })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
});

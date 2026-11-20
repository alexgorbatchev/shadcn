import type { ReactElement } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Button } from "../Button";
import { ThemeProvider } from "../ThemeProvider";
import {
  Tree,
  TreeItem,
  TreeItemDot,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  useTree,
} from "../tree";
import "../../../.storybook/preview.css";

const PAGES = ["Plan", "Notes", "Draft"];

function ReviewTree(): ReactElement {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => item.getId() === "root",
    dataLoader: { getItem: (id) => id, getChildren: (id) => (id === "root" ? PAGES : []) },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <ThemeProvider forcedTheme="light">
      <Tree
        tree={tree}
        label="Review pages"
        variant="sidebar"
        renderItem={(item) => (
          <TreeItem
            item={item}
            isDimmed={item.getId() !== "Plan"}
            isUnread={item.getId() === "Notes"}
            marker={item.getId() === "Notes" ? <TreeItemDot /> : undefined}
            descriptionLabel={item.getId() === "Notes" ? "Reviewed · Reply" : undefined}
            linkProps={
              item.getId() === "Draft"
                ? undefined
                : { href: `#${item.getId()}`, onClick: (event) => event.preventDefault() }
            }
            endEnhancer={
              <Button variant="ghost" size="xs">
                Open {item.getItemName()}
              </Button>
            }
          />
        )}
      />
    </ThemeProvider>
  );
}

function getRow(name: string): HTMLElement {
  // A linked row's tree item is its link, inside the row; a row without a link is the tree item itself.
  const item = page.getByRole("treeitem", { name }).element();
  const row = item.tagName === "A" ? item.parentElement : item;
  if (!(row instanceof HTMLElement)) throw new Error(`missing row ${name}`);
  return row;
}

/** The faded part of a row: its link, or the label wrapper of a row without one. */
function contentOpacity(name: string): string {
  const item = page.getByRole("treeitem", { name }).element();
  const content = item.tagName === "A" ? item : item.querySelector(":scope > div.flex-1");
  return content ? getComputedStyle(content).opacity : "missing content";
}

function markerOpacity(name: string): string {
  const marker = getRow(name).querySelector("[data-slot='tree-item-marker']");
  return marker ? getComputedStyle(marker).opacity : "missing marker";
}

test("dimmed rows return to full opacity while hovered or focused", async () => {
  await render(<ReviewTree />);
  // Earlier tests can leave the pointer anywhere; start it on the undimmed row so Notes is at rest.
  await userEvent.hover(page.getByRole("treeitem", { name: "Plan" }));
  await expect.poll(() => contentOpacity("Notes")).toBe("0.7");
  await expect.poll(() => contentOpacity("Plan")).toBe("1");
  await userEvent.hover(page.getByRole("treeitem", { name: "Notes" }));
  await expect.poll(() => contentOpacity("Notes")).toBe("1");
  await userEvent.hover(page.getByRole("treeitem", { name: "Plan" }));
  await expect.poll(() => contentOpacity("Notes")).toBe("0.7");
  await userEvent.click(page.getByRole("treeitem", { name: "Plan" }));
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "Open Plan" })).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "Open Notes" })).toHaveFocus();
  await expect.poll(() => contentOpacity("Notes")).toBe("1");
});

test("a dimmed row keeps its marker at full opacity and an unread row's label is bold", async () => {
  await render(<ReviewTree />);
  await userEvent.hover(page.getByRole("treeitem", { name: "Plan" }));
  await expect.poll(() => contentOpacity("Notes")).toBe("0.7");
  await expect.poll(() => contentOpacity("Draft")).toBe("0.7");
  // The row itself never fades, so nothing compounds the marker's opacity.
  expect(getComputedStyle(getRow("Notes")).opacity).toBe("1");
  expect(markerOpacity("Notes")).toBe("1");
  const marker = getRow("Notes").querySelector("[data-slot='tree-item-marker']");
  expect(marker?.getAttribute("aria-hidden")).toBe("true");
  expect(marker?.querySelector("svg circle")?.getAttribute("fill")).toBe("currentColor");
  const notesLabel = page.getByRole("treeitem", { name: "Notes" }).element().querySelector(".truncate");
  const planLabel = page.getByRole("treeitem", { name: "Plan" }).element().querySelector(".truncate");
  expect(notesLabel && getComputedStyle(notesLabel).fontWeight).toBe("600");
  expect(planLabel && getComputedStyle(planLabel).fontWeight).not.toBe("600");
  await expect.element(page.getByRole("treeitem", { name: "Notes" })).toHaveAccessibleDescription("Reviewed · Reply");
  expect(getRow("Plan").querySelector("[data-slot='tree-item-marker']")).toBeNull();
});

test("a rollup dot shows the count of new items beside it", async () => {
  await render(
    <ThemeProvider forcedTheme="light">
      <TreeItemDot count={3} />
    </ThemeProvider>,
  );
  const dot = document.querySelector("[data-slot='tree-item-dot']");
  expect(dot?.querySelector("[data-slot='tree-item-dot-count']")?.textContent).toBe("3");
  expect(dot?.getAttribute("aria-hidden")).toBe("true");
});

import type { ReactElement } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Button } from "../Button";
import { ThemeProvider } from "../ThemeProvider";
import { Tree, TreeItem, hotkeysCoreFeature, selectionFeature, syncDataLoaderFeature, useTree } from "../tree";
import "../../../.storybook/preview.css";

const PAGES = ["Plan", "Notes"];

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
            isDimmed={item.getId() === "Notes"}
            linkProps={{ href: `#${item.getId()}`, onClick: (event) => event.preventDefault() }}
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

function rowOpacity(name: string): string {
  const row = page.getByRole("treeitem", { name }).element().parentElement;
  return row ? getComputedStyle(row).opacity : "missing row";
}

test("dimmed rows return to full opacity while hovered or focused", async () => {
  await render(<ReviewTree />);
  // Earlier tests can leave the pointer anywhere; start it on the undimmed row so Notes is at rest.
  await userEvent.hover(page.getByRole("treeitem", { name: "Plan" }));
  await expect.poll(() => rowOpacity("Notes")).toBe("0.7");
  await expect.poll(() => rowOpacity("Plan")).toBe("1");
  await userEvent.hover(page.getByRole("treeitem", { name: "Notes" }));
  await expect.poll(() => rowOpacity("Notes")).toBe("1");
  await userEvent.hover(page.getByRole("treeitem", { name: "Plan" }));
  await expect.poll(() => rowOpacity("Notes")).toBe("0.7");
  await userEvent.click(page.getByRole("treeitem", { name: "Plan" }));
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "Open Plan" })).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "Open Notes" })).toHaveFocus();
  await expect.poll(() => rowOpacity("Notes")).toBe("1");
});

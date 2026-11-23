import type { ReactElement } from "react";
import type { TreeItemStatus } from "../tree";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Button } from "../Button";
import { ThemeProvider } from "../ThemeProvider";
import {
  Tree,
  TreeItem,
  TreeItemAction,
  TreeItemDot,
  TreeItemStatusIcon,
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
  expect(dot?.querySelector("[data-slot='status-dot-count']")?.textContent).toBe("3");
  expect(dot?.getAttribute("aria-hidden")).toBe("true");
});

const STATUSES: TreeItemStatus[] = [
  "needs-answers",
  "needs-review",
  "unsent",
  "failed",
  "held",
  "handed-back",
  "handed-back-unsent",
];

function StatusTree({ onReview }: { onReview: (name: string) => void }): ReactElement {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => item.getId() === "root",
    dataLoader: { getItem: (id) => id, getChildren: (id) => (id === "root" ? [...STATUSES, "draft"] : []) },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <ThemeProvider forcedTheme="light">
      <button type="button">Before</button>
      <Tree
        tree={tree}
        label="Pages"
        variant="sidebar"
        renderItem={(item) => {
          const status = STATUSES.find((value) => value === item.getId());
          const isWaiting =
            status === "needs-answers" || status === "needs-review" || status === "unsent" || status === "failed";
          return (
            <TreeItem
              item={item}
              isDimmed={status === "handed-back" || status === "handed-back-unsent"}
              linkProps={{ href: `#${item.getId()}`, onClick: (event) => event.preventDefault() }}
              leading={
                status === undefined ? null : isWaiting ? (
                  <TreeItemAction aria-label={`Review ${item.getId()}`} onClick={() => onReview(item.getId())}>
                    <TreeItemStatusIcon status={status} />
                  </TreeItemAction>
                ) : (
                  <TreeItemStatusIcon status={status} />
                )
              }
            />
          );
        }}
      />
      <button type="button">After</button>
    </ThemeProvider>
  );
}

test("puts a status control or icon at the row's start, outside its link, with one shape per state", async () => {
  const reviewed: string[] = [];
  await render(<StatusTree onReview={(name) => reviewed.push(name)} />);
  const link = page.getByRole("treeitem", { name: "needs-review", exact: true }).element();
  const row = link.parentElement;
  const leading = row?.querySelector("[data-slot='tree-item-leading']");
  // The slot comes before the link and is not inside it, so its control is its own hit area.
  expect(leading).not.toBeNull();
  expect(link.contains(leading ?? null)).toBe(false);
  expect(leading && link.compareDocumentPosition(leading) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  const shapes = STATUSES.map(
    (status) =>
      page.getByRole("treeitem", { name: status, exact: true }).element().parentElement?.querySelector("svg")
        ?.innerHTML ?? "",
  );
  expect(new Set(shapes.slice(0, 2)).size).toBe(2);
  expect(document.querySelectorAll("[data-status='unsent'] svg, [data-status='handed-back-unsent'] svg")).toHaveLength(
    4,
  );
  // The unsent marker stays a small dot beside the icon, never the icon's size.
  for (const marker of document.querySelectorAll("[data-slot='tree-item-status-marker'] svg"))
    expect(marker.getBoundingClientRect().width).toBeLessThanOrEqual(6);
  // A row without a status keeps an empty slot so titles line up.
  const draft = page.getByRole("treeitem", { name: "draft" }).element().parentElement;
  expect(draft?.querySelector("[data-slot='tree-item-leading']")?.childElementCount).toBe(0);
  // The control is a pointer shortcut: the tree stays one Tab stop.
  await userEvent.click(page.getByRole("button", { name: "Before" }));
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("treeitem", { name: "needs-answers" })).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "After" })).toHaveFocus();
  await userEvent.click(page.getByRole("button", { name: "Review failed" }));
  expect(reviewed).toEqual(["failed"]);
  // A handed-back row fades its start slot with its content.
  const handedBack = page.getByRole("treeitem", { name: "handed-back", exact: true }).element().parentElement;
  await userEvent.hover(page.getByRole("button", { name: "After" }));
  const slot = handedBack?.querySelector("[data-slot='tree-item-leading']");
  await expect.poll(() => (slot ? getComputedStyle(slot).opacity : "missing")).toBe("0.7");
});

function IconlessTree(): ReactElement {
  const tree = useTree<string>({
    rootItemId: "root",
    initialState: { expandedItems: ["Docs"] },
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => item.getId() !== "Plan",
    dataLoader: {
      getItem: (id) => id,
      getChildren: (id) => (id === "root" ? ["Docs"] : id === "Docs" ? ["Plan"] : []),
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <ThemeProvider forcedTheme="light">
      <Tree
        tree={tree}
        label="Pages"
        variant="sidebar"
        renderItem={(item) => <TreeItem item={item} hasIcon={item.getId() !== "Plan"} />}
      />
    </ThemeProvider>
  );
}

test("hasIcon={false} drops the kind icon, so the label starts where the icon was", async () => {
  const screen = await render(<IconlessTree />);
  const plan = screen.getByRole("treeitem", { name: "Plan" }).element();
  const folder = screen.getByRole("treeitem", { name: "Docs" }).element();
  await expect.element(page.getByRole("treeitem", { name: "Plan" })).toBeVisible();
  expect(plan.querySelectorAll("svg")).toHaveLength(0);
  // The folder keeps its default icon beside its chevron.
  expect(folder.querySelectorAll("svg").length).toBeGreaterThan(1);
});

function TonedTree(): ReactElement {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => item.getId() === "root",
    dataLoader: { getItem: (id) => id, getChildren: (id) => (id === "root" ? ["Live", "Quiet"] : []) },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <ThemeProvider forcedTheme="light">
      <Tree
        tree={tree}
        label="Pages"
        variant="sidebar"
        renderItem={(item) => (
          <TreeItem
            item={item}
            hasIcon={false}
            tone={item.getId() === "Live" ? "warning" : "default"}
            startEnhancer={item.getId() === "Live" ? <svg data-testid="live-icon" viewBox="0 0 1 1" /> : undefined}
          />
        )}
      />
    </ThemeProvider>
  );
}

test("a warning-toned row has a leading-edge bar and a coloured start icon but no fill; other rows are untouched", async () => {
  const screen = await render(<TonedTree />);
  const live = screen.getByRole("treeitem", { name: "Live" }).element();
  const quiet = screen.getByRole("treeitem", { name: "Quiet" }).element();
  await expect.element(page.getByRole("treeitem", { name: "Live" })).toBeVisible();
  expect(getComputedStyle(live).backgroundColor).toBe(getComputedStyle(quiet).backgroundColor);
  const bar = getComputedStyle(live, "::before");
  expect(bar.width).toBe("2px");
  expect(bar.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(quiet, "::before").content).toBe("none");
  const icon = screen.getByTestId("live-icon").element().parentElement;
  expect(icon).not.toBeNull();
  expect(getComputedStyle(icon as Element).color).not.toBe(getComputedStyle(quiet).color);
});

test("a selected warning-toned row keeps the selection background and its bar", async () => {
  const screen = await render(<TonedTree />);
  const live = screen.getByRole("treeitem", { name: "Live" });
  const quiet = screen.getByRole("treeitem", { name: "Quiet" });
  await quiet.click();
  await expect.element(quiet).toHaveAttribute("aria-selected", "true");
  const selectedBackground = getComputedStyle(quiet.element()).backgroundColor;
  await live.click();
  await expect.element(live).toHaveAttribute("aria-selected", "true");
  expect(getComputedStyle(live.element()).backgroundColor).toBe(selectedBackground);
  expect(getComputedStyle(live.element(), "::before").width).toBe("2px");
});

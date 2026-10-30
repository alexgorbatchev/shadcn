import { expect, test } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { useState, type ReactElement } from "react";
import { DragDropProvider } from "../DragDropProvider";
import { DragSource } from "../DragSource";
import { DropTarget } from "../DropTarget";
import { Button } from "../Button";
import type { IDragDropItem } from "../../drag-drop/types";
import { renderToString } from "react-dom/server";
import { useDragDrop } from "../../hooks/useDragDrop";
import { useDropTarget } from "../../hooks/useDropTarget";
import "../../../.storybook/preview.css";
import {
  Tree,
  TreeItem,
  useTree,
  syncDataLoaderFeature,
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  keyboardDragAndDropFeature,
  isOrderedDragTarget,
  AssistiveTreeDescription,
} from "../tree";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuGroup, ContextMenuItem } from "../ContextMenu";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";

interface ITreeExampleProps {
  isDisabled?: boolean;
  isComposed?: boolean;
  isLinked?: boolean;
}
interface ITreeData {
  name: string;
  children?: string[];
}
const treeItems: Record<string, ITreeData> = {
  root: { name: "Root", children: ["folder", "first", "second"] },
  folder: { name: "Folder", children: ["child"] },
  child: { name: "Child" },
  first: { name: "First" },
  second: { name: "Second" },
};
function TreeExample({ isDisabled = false, isComposed = false, isLinked = false }: ITreeExampleProps): ReactElement {
  const [result, setResult] = useState("Waiting");
  const [navigations, setNavigations] = useState(0);
  const tree = useTree<ITreeData>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().children),
    dataLoader: {
      getItem: (id) => treeItems[id]!,
      getChildren: (id) =>
        isLinked && id === "root" ? ["first", "second", "folder"] : (treeItems[id]?.children ?? []),
    },
    canReorder: !isLinked,
    indent: 20,
    canDrag: () => !isDisabled,
    onDrop: (items, target) =>
      setResult(
        JSON.stringify({
          ids: items.map((item) => item.getId()),
          parent: target.item.getId(),
          before: isOrderedDragTarget(target) ? target.childIndex : null,
        }),
      ),
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      selectionFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });
  return (
    <>
      <Tree
        tree={tree}
        label="Reorder files"
        renderItem={
          isLinked
            ? (item) => (
                <TreeItem
                  item={item}
                  expandOn="disclosure"
                  linkProps={{
                    href: `#${item.getId()}`,
                    onClick: (event) => {
                      event.preventDefault();
                      setNavigations((count) => count + 1);
                    },
                  }}
                  dropHint={{ content: "Drop into folder", open: item.isUnorderedDragTarget() }}
                />
              )
            : isComposed
              ? (item) => (
                  <ContextMenu>
                    <Tooltip open={false}>
                      <TooltipTrigger render={<ContextMenuTrigger render={<TreeItem item={item} />} />}>
                        {item.getItemName()}
                      </TooltipTrigger>
                      <TooltipContent>Row information</TooltipContent>
                    </Tooltip>
                    <ContextMenuContent>
                      <ContextMenuGroup>
                        <ContextMenuItem>Inspect {item.getItemName()}</ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              : undefined
        }
      />
      <AssistiveTreeDescription tree={tree} />
      <output aria-label="Tree drop">{result}</output>
      <output aria-label="Tree navigation">{navigations}</output>
    </>
  );
}

test("linked tree rows retain native pointer dropping and keyboard drop ownership", async () => {
  const screen = await render(<TreeExample isLinked />);
  const first = page.getByRole("treeitem", { name: "First" });
  const folder = page.getByRole("treeitem", { name: "Folder" });
  await first.dropTo(folder);
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["first"],"parent":"folder","before":null}');
  await expect.element(page.getByText("Drop into folder", { exact: true })).not.toBeInTheDocument();
  await page.getByRole("treeitem", { name: "Second" }).click();
  await expect.element(screen.getByRole("status", { name: "Tree navigation" })).toHaveTextContent("1");
  await userEvent.keyboard("{Control>}{Shift>}d{/Shift}{/Control}");
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(page.getByText("Drop into folder", { exact: true })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByText("Drop into folder", { exact: true })).not.toBeInTheDocument();
  await userEvent.keyboard("{Control>}{Shift>}d{/Shift}{/Control}");
  await userEvent.keyboard("{ArrowUp}{Enter}");
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["second"],"parent":"folder","before":null}');
  await expect.element(screen.getByRole("status", { name: "Tree navigation" })).toHaveTextContent("1");
  await expect.element(page.getByText("Drop into folder", { exact: true })).not.toBeInTheDocument();
  await expect.element(page.getByRole("treeitem", { name: "Second" })).toHaveFocus();
});

test("tree drops into a folder and reorders before and after siblings", async () => {
  const screen = await render(<TreeExample />);
  const first = page.getByRole("treeitem", { name: "First" });
  const second = page.getByRole("treeitem", { name: "Second" });
  await first.dropTo(page.getByRole("treeitem", { name: "Folder" }));
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["first"],"parent":"folder","before":null}');
  await second.dropTo(first, { targetPosition: { x: 30, y: 2 } });
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["second"],"parent":"root","before":1}');
  await first.dropTo(second, { targetPosition: { x: 30, y: 26 } });
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["first"],"parent":"root","before":3}');
});

test("composed tree rows preserve native before/after drop geometry through menus and tooltips", async () => {
  const screen = await render(<TreeExample isComposed />);
  const first = page.getByRole("treeitem", { name: "First" });
  const second = page.getByRole("treeitem", { name: "Second" });
  await second.dropTo(first, { targetPosition: { x: 40, y: 2 } });
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["second"],"parent":"root","before":1}');
  await first.dropTo(second, { targetPosition: { x: 40, y: second.element().getBoundingClientRect().height - 2 } });
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["first"],"parent":"root","before":3}');
  await expect.element(first).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(second).toHaveFocus();
});

test("nested outdenting places the insertion line after the complete subtree", async () => {
  const screen = await render(<TreeExample />);
  await page.getByRole("treeitem", { name: "Folder" }).click();
  const geometry = await commands.treeDropGeometry("Second", "Child", "First");
  expect(geometry.lineCenter).toBeCloseTo(geometry.expectedTop, 0);
  expect(geometry.lineLeft).toBeCloseTo(geometry.expectedLeft, 0);
  await expect
    .element(screen.getByRole("status", { name: "Tree drop" }))
    .toHaveTextContent('{"ids":["second"],"parent":"root","before":1}');
});

test("tree rejects disabled dragging", async () => {
  const screen = await render(<TreeExample isDisabled />);
  await page.getByRole("treeitem", { name: "First" }).dropTo(page.getByRole("treeitem", { name: "Folder" }));
  await expect.element(screen.getByRole("status", { name: "Tree drop" })).toHaveTextContent("Waiting");
});

test("tree keyboard dragging can be cancelled and completed", async () => {
  const screen = await render(<TreeExample />);
  await page.getByRole("treeitem", { name: "Second" }).click();
  await userEvent.keyboard("{Control>}{Shift>}d{/Shift}{/Control}");
  await userEvent.keyboard("{ArrowUp}{Escape}");
  await expect.element(screen.getByRole("status", { name: "Tree drop" })).toHaveTextContent("Waiting");
  await userEvent.keyboard("{Control>}{Shift>}d{/Shift}{/Control}");
  await userEvent.keyboard("{ArrowUp}{Enter}");
  await expect.element(screen.getByRole("status", { name: "Tree drop" })).not.toHaveTextContent("Waiting");
});

test("requires a provider for drag and drop hooks", () => {
  function Probe(): ReactElement {
    const context = useDragDrop();
    return <p>{context.active?.type}</p>;
  }
  expect(() => renderToString(<Probe />)).toThrow("Drag and drop requires DragDropProvider.");
});

interface IExampleProps {
  type?: string;
  labels?: readonly string[];
  disabled?: boolean;
  canDrop?: (item: IDragDropItem) => boolean;
}

function Example({
  type = "application/x-test",
  labels = ["First light"],
  disabled,
  canDrop,
}: IExampleProps): ReactElement {
  const [result, setResult] = useState("Waiting");
  return (
    <DragDropProvider>
      <div className="flex gap-12 p-8">
        <DragSource type={type} data={{ title: "First light" }} labels={labels} disabled={disabled} render={<Button />}>
          Source
        </DragSource>
        <DropTarget
          accept={["application/x-test"]}
          canDrop={canDrop}
          getDropEffect={(_item, event) => (event.altKey ? "copy" : "move")}
          onDrop={(item, event) =>
            setResult(
              JSON.stringify({ data: item.data, alt: event.altKey, text: event.dataTransfer.getData("text/plain") }),
            )
          }
          render={<Button variant="outline" />}
        >
          Target
        </DropTarget>
        <output aria-label="Result">{result}</output>
      </div>
    </DragDropProvider>
  );
}

test("native dragging transfers the payload and labels and cleans up its preview", async () => {
  const screen = await render(<Example />);
  await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await expect
    .element(screen.getByRole("status", { name: "Result" }))
    .toHaveTextContent('{"data":{"title":"First light"},"alt":false,"text":"First light"}');
  await expect.element(screen.getByRole("status", { name: "Drag status" })).toHaveTextContent("");
});

test("Alt is preserved for native copy operations", async () => {
  const screen = await render(<Example />);
  await userEvent.keyboard("{Alt>}");
  await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await userEvent.keyboard("{/Alt}");
  await expect
    .element(screen.getByRole("status", { name: "Result" }))
    .toHaveTextContent('{"data":{"title":"First light"},"alt":true,"text":"First light"}');
});

test("retains accepted feedback after leaving a target so exit hints keep their meaning", async () => {
  function FeedbackTarget(): ReactElement {
    const target = useDropTarget({
      accept: ["application/x-test"],
      getDropEffect: (_item, event) => (event.altKey ? "copy" : "move"),
      onDrop: () => {},
    });
    return (
      <>
        <Button {...target.props}>Target</Button>
        <output aria-label="Feedback">{JSON.stringify(target.feedback)}</output>
        <output aria-label="Hovering">{String(target.isOver)}</output>
      </>
    );
  }
  const screen = await render(
    <DragDropProvider>
      <div className="flex gap-12 p-8">
        <DragSource
          type="application/x-test"
          data={{ title: "First light" }}
          labels={["First light"]}
          render={<Button />}
        >
          Source
        </DragSource>
        <FeedbackTarget />
      </div>
    </DragDropProvider>,
  );
  await userEvent.keyboard("{Alt>}");
  await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await userEvent.keyboard("{/Alt}");
  await expect.element(screen.getByRole("status", { name: "Hovering" })).toHaveTextContent("false");
  await expect
    .element(screen.getByRole("status", { name: "Feedback" }))
    .toHaveTextContent('{"type":"application/x-test","isAlt":true,"effect":"copy"}');
  await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await expect
    .element(screen.getByRole("status", { name: "Feedback" }))
    .toHaveTextContent('{"type":"application/x-test","isAlt":false,"effect":"move"}');
});

test.each([{ type: "application/x-unrelated" }, { canDrop: () => false }, { disabled: true }, { labels: [] }])(
  "rejects unavailable or unrelated drag operations %#",
  async (options) => {
    const screen = await render(<Example {...options} />);
    await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
    await expect.element(screen.getByRole("status", { name: "Result" })).toHaveTextContent("Waiting");
  },
);

test("accepts native drags that started outside the provider and preserves non-JSON text", async () => {
  function ExternalExample(): ReactElement {
    const [result, setResult] = useState("");
    return (
      <div className="flex gap-12 p-8">
        <button
          type="button"
          draggable
          onDragStart={(event) => event.dataTransfer.setData("text/plain", "External text")}
        >
          External source
        </button>
        <DragDropProvider>
          <DropTarget
            accept={["text/plain"]}
            onDrop={(item) => setResult(JSON.stringify(item.data))}
            render={<Button />}
          >
            Target
          </DropTarget>
        </DragDropProvider>
        <output aria-label="Result">{result}</output>
      </div>
    );
  }
  const screen = await render(<ExternalExample />);
  await page.getByRole("button", { name: "External source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await expect.element(screen.getByRole("status", { name: "Result" })).toHaveTextContent('"External text"');
});

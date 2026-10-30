import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor, fn } from "storybook/test";
import { Tree, TreeItem, useTree, syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature } from "../../tree";
import { Button } from "../../Button";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
} from "../../ContextMenu";
import { InlineEdit } from "../../InlineEdit";
import { useState } from "react";
type Item = {
  name: string;
  children?: string[];
};
const items: Record<string, Item> = {
  root: { name: "Root", children: ["src", "readme"] },
  src: { name: "Source", children: ["button", "input"] },
  button: { name: "Button.tsx" },
  input: { name: "Input.tsx" },
  readme: { name: "README.md" },
};
const action = fn();
const navigate = fn();
const primary = fn();
const sourceLinkRef = fn();
const sourceRowRef = fn();
const renderedLinkClick = fn();
function LinkExample() {
  const [hintOpen, setHintOpen] = useState(false);
  const tree = useTree<Item>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().children),
    dataLoader: {
      getItem: (id) => items[id]!,
      getChildren: (id) => items[id]?.children ?? [],
    },
    onPrimaryAction: primary,
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <>
      <Button onClick={() => setHintOpen((open) => !open)}>Toggle drop hint</Button>
      <Tree
        tree={tree}
        label="Linked files"
        renderItem={(item) => (
          <ContextMenu>
            <TreeItem
              item={item}
              expandOn="disclosure"
              render={<ContextMenuTrigger />}
              ref={item.getId() === "src" ? sourceRowRef : undefined}
              linkProps={{
                render: <a onClick={renderedLinkClick} />,
                href: `#${item.getId()}`,
                ref: item.getId() === "src" ? sourceLinkRef : undefined,
                "aria-current": item.getId() === "src" ? "page" : undefined,
                onClick: (event) => {
                  navigate(item.getId(), event.defaultPrevented, event.ctrlKey, event.metaKey);
                  event.preventDefault();
                },
              }}
              dropHint={{ content: "Move to folder", open: hintOpen && item.getId() === "src" }}
              endEnhancer={<Button onClick={action}>Inspect {item.getItemName()}</Button>}
            />
            <ContextMenuContent>
              <ContextMenuGroup>
                <ContextMenuItem onClick={action}>Details {item.getItemName()}</ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuContent>
          </ContextMenu>
        )}
      />
    </>
  );
}
function Example({ isComposed = false, isConstrained = false }: { isComposed?: boolean; isConstrained?: boolean }) {
  const tree = useTree<Item>({
    rootItemId: "root",
    getItemName: (item) =>
      isConstrained ? `${item.getItemData().name} with a very long descriptive name` : item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().children),
    dataLoader: {
      getItem: (id) => {
        const item = items[id];
        if (!item) throw new Error(`Unknown item ${id}`);
        return item;
      },
      getChildren: (id) => items[id]?.children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <Tree
      tree={tree}
      label="Project files"
      variant={isComposed ? "sidebar" : "default"}
      renderItem={
        isComposed
          ? (item) => (
              <ContextMenu>
                <ContextMenuTrigger
                  render={
                    <TreeItem
                      item={item}
                      expandOn={isConstrained ? "disclosure" : "doubleClick"}
                      endEnhancer={
                        isConstrained ? (
                          <>
                            <span>1234</span>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              aria-label={`Actions for ${item.getItemName()}`}
                              onClick={action}
                            >
                              …
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={action}>
                            Actions for {item.getItemName()}
                          </Button>
                        )
                      }
                    />
                  }
                />
                <ContextMenuContent>
                  <ContextMenuGroup>
                    <ContextMenuItem onClick={action}>Inspect {item.getItemName()}</ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            )
          : undefined
      }
    />
  );
}
const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/navigation/Tree",
  tags: ["autodocs", "test"],
  render: () => <Example />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const LinkRows: Story = {
  render: () => <LinkExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const source = canvas.getByRole("treeitem", { name: "Source" });
    await expect(source.tagName).toBe("A");
    await expect(source).toHaveAttribute("href", "#src");
    await expect(source).toHaveAttribute("aria-current", "page");
    await expect(sourceLinkRef).toHaveBeenLastCalledWith(source);
    await expect(sourceRowRef).toHaveBeenLastCalledWith(source.parentElement);
    await expect(source.parentElement).not.toHaveAttribute("tabindex");
    await expect(source.querySelector("button")).toBeNull();
    await userEvent.click(source);
    await expect(navigate).toHaveBeenLastCalledWith("src", false, false, false);
    await expect(primary).not.toHaveBeenCalled();
    await expect(source).toHaveAttribute("aria-expanded", "false");
    await expect(source).toHaveAttribute("aria-selected", "true");
    await expect(source).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(navigate).toHaveBeenCalledTimes(2);
    await userEvent.keyboard("{Control>}");
    await userEvent.click(source);
    await userEvent.keyboard("{/Control}");
    await expect(navigate).toHaveBeenLastCalledWith("src", false, true, false);
    await expect(primary).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowRight}");
    await expect(source).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowDown}");
    const child = canvas.getByRole("treeitem", { name: "Button.tsx" });
    await waitFor(() => expect(child).toHaveFocus());
    await expect(
      canvas.getByRole("tree", { name: "Linked files" }).querySelectorAll('[role="treeitem"][tabindex="0"]'),
    ).toHaveLength(1);
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(source).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Collapse Source" }));
    await expect(source).toHaveAttribute("aria-expanded", "false");
    await expect(navigate).toHaveBeenCalledTimes(3);
    await userEvent.click(canvas.getByRole("button", { name: "Inspect Source" }));
    await expect(action).toHaveBeenCalledTimes(1);
    await expect(navigate).toHaveBeenCalledTimes(3);
    await expect(primary).not.toHaveBeenCalled();
    await userEvent.pointer({ target: source, keys: "[MouseRight]" });
    const menu = await within(canvasElement.ownerDocument.body).findByRole("menuitem", { name: "Details Source" });
    await expect(menu).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(source);
    await expect(navigate).toHaveBeenCalledTimes(4);
    await expect(renderedLinkClick).toHaveBeenCalledTimes(4);
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(canvas.getByRole("treeitem", { name: "README.md" })).toHaveFocus());
  },
};
export const ControlledDropHint: Story = {
  render: () => <LinkExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    await expect(document.querySelector('[data-slot="tooltip-content"]')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Toggle drop hint" }));
    await waitFor(() =>
      expect(document.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent("Move to folder"),
    );
    await waitFor(() => expect(document.querySelector('[data-slot="tooltip-content"]')).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Toggle drop hint" }));
    await waitFor(() => expect(document.querySelector('[data-slot="tooltip-content"]')).not.toBeInTheDocument());
  },
};
export const ConstrainedRows: Story = {
  render: () => (
    <div className="w-[260px]">
      <Example isComposed isConstrained />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole("tree", { name: "Project files" });
    const row = canvas.getByRole("treeitem", { name: "Source with a very long descriptive name" });
    const count = within(row).getByText("1234", { exact: true });
    const actions = within(row).getByRole("button", { name: "Actions for Source with a very long descriptive name" });
    await expect(
      canvas.getByText("Source with a very long descriptive name", { exact: true }).getBoundingClientRect().left,
    ).toBe(
      canvas.getByText("README.md with a very long descriptive name", { exact: true }).getBoundingClientRect().left,
    );
    await expect(count.getBoundingClientRect().right).toBeLessThanOrEqual(tree.getBoundingClientRect().right);
    await expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(tree.getBoundingClientRect().right);
    await userEvent.click(row);
    await expect(row).toHaveAttribute("aria-expanded", "false");
    const disclosure = within(row).getByRole("button", { name: "Expand Source with a very long descriptive name" });
    await expect(getComputedStyle(disclosure).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await userEvent.hover(disclosure);
    await waitFor(() => expect(disclosure.getAnimations()).toHaveLength(0));
    await expect(getComputedStyle(disclosure).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await userEvent.click(disclosure);
    await userEvent.unhover(disclosure);
    await waitFor(() => expect(disclosure.getAnimations()).toHaveLength(0));
    await expect(getComputedStyle(disclosure).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(row).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("treeitem", { name: "Button.tsx with a very long descriptive name" })).toBeVisible();
    await userEvent.click(
      within(row).getByRole("button", { name: "Collapse Source with a very long descriptive name" }),
    );
    await expect(row).toHaveAttribute("aria-expanded", "false");
  },
};
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    const source = c.getByRole("treeitem", { name: "Source" });
    await expect(source).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(source);
    await expect(source).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(c.getByRole("treeitem", { name: "Button.tsx" })).toHaveFocus());
    await userEvent.keyboard("{Control>}[Space]{/Control}");
    await expect(c.getByRole("treeitem", { name: "Button.tsx" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(source).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await expect(source).toHaveAttribute("aria-expanded", "false");
  },
};
export const ComposedRows: Story = {
  render: () => <Example isComposed />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const source = canvas.getByRole("treeitem", { name: "Source" });
    await userEvent.click(source);
    await expect(source).toHaveAttribute("aria-expanded", "false");
    await expect(source).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Source" }));
    await expect(action).toHaveBeenCalledTimes(1);
    await expect(source).toHaveAttribute("aria-expanded", "false");
    await userEvent.dblClick(source);
    await expect(source).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("treeitem", { name: "Button.tsx" })).toBeVisible();
    source.focus();
    await userEvent.keyboard("{Enter}");
    await expect(source).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Enter}");
    await expect(source).toHaveAttribute("aria-expanded", "true");
    await userEvent.pointer({ target: source, keys: "[MouseRight]" });
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).getByRole("menuitem", { name: "Inspect Source" })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await userEvent.click(source);
    await userEvent.keyboard("{Control>}");
    await userEvent.click(canvas.getByRole("treeitem", { name: "README.md" }));
    await userEvent.keyboard("{/Control}");
    await expect(source).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("treeitem", { name: "README.md" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(source);
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(canvas.getByRole("treeitem", { name: "README.md" }));
    await userEvent.keyboard("{/Shift}");
    await expect(canvas.getByRole("treeitem", { name: "Button.tsx" })).toHaveAttribute("aria-selected", "true");
  },
};

function EditableExample() {
  const [savedTitle, setSavedTitle] = useState("Source");
  const [title, setTitle] = useState("Source");
  const [isEditing, setEditing] = useState(false);
  const tree = useTree<Item>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().children),
    dataLoader: {
      getItem: (id) => {
        const item = items[id];
        if (!item) throw new Error("Unknown tree item");
        return id === "src" ? { ...item, name: savedTitle } : item;
      },
      getChildren: (id) => items[id]?.children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <Tree
      tree={tree}
      label="Editable files"
      renderItem={(item) => (
        <TreeItem
          item={item}
          isEditing={isEditing && item.getId() === "src"}
          startEnhancer={<span>F</span>}
          endEnhancer={
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Rename {item.getItemName()}
            </Button>
          }
        >
          {isEditing && item.getId() === "src" ? (
            <InlineEdit
              label="File title"
              value={title}
              onValueChange={setTitle}
              onCommit={(value) => {
                setSavedTitle(value);
                setEditing(false);
              }}
              onCancel={() => {
                setTitle(savedTitle);
                setEditing(false);
              }}
            />
          ) : (
            item.getItemName()
          )}
        </TreeItem>
      )}
    />
  );
}

export const EditableRows: Story = {
  render: () => <EditableExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const source = canvas.getByRole("treeitem", { name: "Source" });
    await userEvent.click(canvas.getByRole("button", { name: "Rename Source" }));
    const editor = canvas.getByRole("textbox", { name: "File title" });
    await expect(editor).toHaveFocus();
    await expect(source).toHaveAttribute("draggable", "false");
    await userEvent.type(editor, "Unsaved");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("textbox", { name: "File title" })).not.toBeInTheDocument();
    await expect(source).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Rename Source" }));
    await expect(canvas.getByRole("textbox", { name: "File title" })).toHaveValue("Source");
    await userEvent.clear(canvas.getByRole("textbox", { name: "File title" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "File title" }), "Renamed");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("textbox", { name: "File title" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("treeitem", { name: "Renamed" })).toBeVisible();
  },
};

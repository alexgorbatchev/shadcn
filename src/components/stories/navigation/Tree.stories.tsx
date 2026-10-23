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
function Example({ isComposed = false }: { isComposed?: boolean }) {
  const tree = useTree<Item>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
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
                      expandOn="doubleClick"
                      endEnhancer={
                        <Button size="sm" variant="ghost" onClick={action}>
                          Actions for {item.getItemName()}
                        </Button>
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

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { Tree, useTree, syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature } from "../../tree";
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
function Example() {
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
  return <Tree tree={tree} label="Project files" />;
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

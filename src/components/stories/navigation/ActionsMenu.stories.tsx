import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  ActionsMenu,
  ActionsMenuContextTarget,
  ActionsMenuContextContent,
  ActionsMenuTrigger,
} from "../../ActionsMenu";
import {
  MenuGroup,
  MenuItem,
  MenuLinkItem,
  MenuLabel,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "../../MenuParts";
import { Button } from "../../Button";
import { Tree, TreeItem, useTree, syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature } from "../../tree";
import type { ReactElement } from "react";
import { fixture_menuAction, fixture_menuTargetRef } from "./fixtures";

const meta: Meta<typeof ActionsMenu> = {
  title: "@alexgorbatchev/shadcn/navigation/ActionsMenu",
  component: ActionsMenu,
  tags: ["autodocs", "test"],
  args: {
    label: "Track actions",
    items: (
      <MenuGroup>
        <MenuItem onClick={() => fixture_menuAction("track-42")}>Inspect track</MenuItem>
      </MenuGroup>
    ),
  },
  beforeEach: () => {
    fixture_menuAction.mockClear();
    fixture_menuTargetRef.mockClear();
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

function RegisteredTreeExample(): ReactElement {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => false,
    dataLoader: {
      getItem: (id) => id,
      getChildren: () => ["Source", "Destination"],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <Tree
      tree={tree}
      label="Track folders"
      renderItem={(item) => (
        <ActionsMenu
          label={`${item.getId()} actions`}
          items={
            <MenuGroup>
              <MenuItem onClick={() => fixture_menuAction(item.getId())}>Inspect {item.getId()}</MenuItem>
            </MenuGroup>
          }
        >
          <TreeItem item={item} render={<ActionsMenuContextTarget />} endEnhancer={<ActionsMenuTrigger />} />
          <ActionsMenuContextContent />
        </ActionsMenu>
      )}
    />
  );
}

export const RegisteredTree: Story = {
  render: () => <RegisteredTreeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const source = await canvas.findByRole("treeitem", { name: "Source" });
    await userEvent.click(source);
    await expect(source).toHaveAttribute("tabindex", "0");
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(canvas.getByRole("treeitem", { name: "Destination" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Source actions" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Inspect Source" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(1);
    await expect(fixture_menuAction).toHaveBeenCalledWith("Source");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await userEvent.pointer({ target: source, keys: "[MouseRight]" });
    await userEvent.click(await body.findByRole("menuitem", { name: "Inspect Source" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(2);
    await expect(fixture_menuAction).toHaveBeenLastCalledWith("Source");
    await expect(canvas.getAllByRole("treeitem")).toHaveLength(2);
  },
};

export const Dropdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Track actions" });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("menuitem", { name: "Inspect track" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(1);
    await expect(fixture_menuAction).toHaveBeenCalledWith("track-42");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const BothEntryPoints: Story = {
  args: { contextTarget: <section aria-label="Track" /> },
  render: (args) => (
    <ActionsMenu {...args}>
      <p>Selected track</p>
      <ActionsMenuTrigger />
    </ActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.pointer({ target: canvas.getByRole("region", { name: "Track" }), keys: "[MouseRight]" });
    await userEvent.click(await body.findByRole("menuitem", { name: "Inspect track" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(1);
    await expect(fixture_menuAction).toHaveBeenCalledWith("track-42");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Track actions" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Inspect track" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(2);
    await expect(fixture_menuAction).toHaveBeenLastCalledWith("track-42");
  },
};

export const NativeTableRow: Story = {
  render: (args) => (
    <table>
      <tbody>
        <ActionsMenu {...args}>
          <ActionsMenuContextTarget render={<tr ref={fixture_menuTargetRef} />}>
            <td>Track title</td>
            <td>
              <ActionsMenuTrigger />
              <ActionsMenuContextContent />
            </td>
          </ActionsMenuContextTarget>
        </ActionsMenu>
      </tbody>
    </table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const row = canvas.getByRole("row");
    await expect(row.parentElement?.tagName).toBe("TBODY");
    await expect(fixture_menuTargetRef).toHaveBeenCalledWith(row);
    await userEvent.click(canvas.getByRole("button", { name: "Track actions" }));
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Inspect track" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await userEvent.pointer({ target: row, keys: "[MouseRight]" });
    await userEvent.click(await body.findByRole("menuitem", { name: "Inspect track" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(1);
    await expect(fixture_menuAction).toHaveBeenCalledWith("track-42");
  },
};

export const Disabled: Story = {
  args: { disabled: true, contextTarget: <section aria-label="Protected track" /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Track actions" })).toBeDisabled();
    await userEvent.pointer({ target: canvas.getByRole("region", { name: "Protected track" }), keys: "[MouseRight]" });
    await expect(within(canvasElement.ownerDocument.body).queryByRole("menu")).not.toBeInTheDocument();
    await expect(fixture_menuAction).not.toHaveBeenCalled();
  },
};

export const Submenu: Story = {
  args: {
    trigger: <Button variant="outline" />,
    contextTarget: <section aria-label="Playlist track" />,
    items: (
      <>
        <MenuGroup>
          <MenuLabel>Track</MenuLabel>
          <MenuItem disabled>Unavailable action</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuSub>
            <MenuSubTrigger>Playlist</MenuSubTrigger>
            <MenuSubContent>
              <MenuGroup>
                <MenuItem onClick={() => fixture_menuAction("playlist-7", "track-42")}>Add to favorites</MenuItem>
              </MenuGroup>
            </MenuSubContent>
          </MenuSub>
        </MenuGroup>
      </>
    ),
  },
  render: (args) => (
    <ActionsMenu {...args}>
      <ActionsMenuTrigger>Track options</ActionsMenuTrigger>
    </ActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Track actions" });
    await userEvent.click(trigger);
    await expect(await body.findByRole("menuitem", { name: "Unavailable action" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Unavailable action" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(fixture_menuAction).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Playlist" })).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.click(await body.findByRole("menuitem", { name: "Add to favorites" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(1);
    await expect(fixture_menuAction).toHaveBeenCalledWith("playlist-7", "track-42");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.pointer({ target: canvas.getByRole("region", { name: "Playlist track" }), keys: "[MouseRight]" });
    await userEvent.click(await body.findByRole("menuitem", { name: "Playlist" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Add to favorites" }));
    await expect(fixture_menuAction).toHaveBeenCalledTimes(2);
    await expect(fixture_menuAction).toHaveBeenLastCalledWith("playlist-7", "track-42");
  },
};

export const NativeLink: Story = {
  args: {
    size: "sm",
    items: (
      <MenuGroup>
        <MenuLinkItem
          href="#details"
          onClick={(event) => {
            fixture_menuAction(event.currentTarget.hash);
            event.preventDefault();
          }}
        >
          View details
        </MenuLinkItem>
      </MenuGroup>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Track actions" }));
    const link = await within(canvasElement.ownerDocument.body).findByRole("menuitem", { name: "View details" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("href", "#details");
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(link).toHaveFocus());
    await userEvent.keyboard(" ");
    await expect(fixture_menuAction).toHaveBeenCalledTimes(1);
    await expect(fixture_menuAction).toHaveBeenCalledWith("#details");
    await userEvent.keyboard("{Enter}");
    await expect(fixture_menuAction).toHaveBeenCalledTimes(2);
    await expect(fixture_menuAction).toHaveBeenLastCalledWith("#details");
    await userEvent.keyboard("{Escape}");
  },
};

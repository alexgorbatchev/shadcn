import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { expect, within, waitFor } from "storybook/test";

import { PortalProvider } from "../PortalProvider.js";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "../Popover.js";
import { Button } from "../Button.js";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../Dialog.js";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "../Sheet.js";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../Tooltip.js";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../HoverCard.js";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../Select.js";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../DropdownMenu.js";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
} from "../AlertDialog.js";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerClose } from "../Drawer.js";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from "../Combobox.js";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "../ContextMenu.js";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "../NavigationMenu.js";
import { ToastToaster, createToastManager } from "../Toast.js";

interface IScopedOverlayProps {
  children: ReactNode;
}
function ScopedOverlay({ children }: IScopedOverlayProps): ReactElement {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <section aria-label="Scoped workspace">
      <div ref={setContainer} />
      {container && <PortalProvider container={container}>{children}</PortalProvider>}
    </section>
  );
}

function ScopedPopover(): ReactElement {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <section aria-label="Scoped workspace">
      <div ref={setContainer} />
      {container && (
        <PortalProvider container={container}>
          <Popover>
            <PopoverTrigger render={<Button />}>Workspace details</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Scoped details</PopoverTitle>
              <Button>Inspect</Button>
            </PopoverContent>
          </Popover>
        </PortalProvider>
      )}
    </section>
  );
}

const meta: Meta<typeof PortalProvider> = {
  title: "shadcn-alexgorbatchev/components/PortalProvider",
  component: PortalProvider,
  tags: ["autodocs", "test"],
  render: () => <ScopedPopover />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const PopoverContainer: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Workspace details" });
    await userEvent.click(trigger);
    const popup = await within(canvas.getByRole("region", { name: "Scoped workspace" })).findByRole("dialog", {
      name: "Scoped details",
    });
    await waitFor(() => expect(popup).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const DialogContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <Dialog>
        <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Scoped dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Scoped dialog" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
export const SheetContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <Sheet>
        <SheetTrigger render={<Button />}>Open sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Scoped sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open sheet" }));
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Scoped sheet" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
export const TooltipContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger render={<Button />}>Hover tooltip</TooltipTrigger>
          <TooltipContent>Scoped tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Hover tooltip" }));
    await waitFor(() => expect(canvas.getByText("Scoped tooltip")).toBeVisible());
    await userEvent.unhover(canvas.getByRole("button", { name: "Hover tooltip" }));
    await waitFor(() => expect(canvas.queryByText("Scoped tooltip")).not.toBeInTheDocument());
  },
};
export const HoverCardContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <HoverCard>
        <HoverCardTrigger render={<Button />} delay={0}>
          Hover preview
        </HoverCardTrigger>
        <HoverCardContent>Scoped preview</HoverCardContent>
      </HoverCard>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Hover preview" }));
    await waitFor(() => expect(canvas.getByText("Scoped preview")).toBeVisible());
    await userEvent.unhover(canvas.getByRole("button", { name: "Hover preview" }));
    await waitFor(() => expect(canvas.queryByText("Scoped preview")).not.toBeInTheDocument());
  },
};
export const SelectContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <Select
        items={[
          { value: "codex", label: "Codex" },
          { value: "claude", label: "Claude" },
        ]}
        defaultValue="codex"
      >
        <SelectTrigger aria-label="Harness">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="codex">Codex</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
        </SelectContent>
      </Select>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Harness" }));
    const option = await canvas.findByRole("option", { name: "Claude" });
    await userEvent.click(option);
    await expect(canvas.getByRole("combobox", { name: "Harness" })).toHaveTextContent("Claude");
  },
};
export const MenuContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Inspect context</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inspect context" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("menu")).not.toBeInTheDocument());
  },
};

export const AlertDialogContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Review removal</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Remove workspace?</AlertDialogTitle>
          <AlertDialogCancel>Keep workspace</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Review removal" }));
    await waitFor(() => expect(canvas.getByRole("alertdialog", { name: "Remove workspace?" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Keep workspace" }));
    await waitFor(() => expect(canvas.queryByRole("alertdialog")).not.toBeInTheDocument());
  },
};

export const DrawerContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <Drawer>
        <DrawerTrigger render={<Button />}>Open workspace drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Workspace drawer</DrawerTitle>
          <DrawerClose render={<Button />}>Close drawer</DrawerClose>
        </DrawerContent>
      </Drawer>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open workspace drawer" }));
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Workspace drawer" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Close drawer" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const ComboboxContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <Combobox items={["Alpha", "Beta"]}>
        <ComboboxInput aria-label="Workspace model" />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Workspace model" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Beta" }));
    await expect(canvas.getByRole("combobox", { name: "Workspace model" })).toHaveValue("Beta");
  },
};

export const ContextMenuContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <ContextMenu>
        <ContextMenuTrigger>Workspace context</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Inspect workspace</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.pointer({ target: canvas.getByText("Workspace context"), keys: "[MouseRight]" });
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inspect workspace" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("menu")).not.toBeInTheDocument());
  },
};

export const NavigationContainer: Story = {
  render: () => (
    <ScopedOverlay>
      <NavigationMenu defaultValue="workspace">
        <NavigationMenuList>
          <NavigationMenuItem value="workspace">
            <NavigationMenuTrigger>Workspace navigation</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#workspace">Workspace overview</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </ScopedOverlay>
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("link", { name: "Workspace overview" })).toBeVisible();
  },
};

export const ToastContainer: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    return (
      <ScopedOverlay>
        <ToastToaster toastManager={manager} timeout={0}>
          <Button onClick={() => manager.add({ title: "Workspace saved" })}>Save workspace</Button>
        </ToastToaster>
      </ScopedOverlay>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save workspace" }));
    await waitFor(() => expect(canvas.getByRole("heading", { name: "Workspace saved" })).toBeVisible());
    await userEvent.keyboard("{F6}");
    await userEvent.click(canvas.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(canvas.queryByRole("heading", { name: "Workspace saved" })).not.toBeInTheDocument());
  },
};

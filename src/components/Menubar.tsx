import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type {
  MenuLabelProps,
  MenuItemProps,
  MenuSubTriggerProps,
  MenuCheckboxItemProps,
  MenuRadioItemProps,
  MenuPopupProps,
} from "../menu/types.js";
import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { CheckIcon } from "lucide-react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import { cn } from "../utils/cn.js";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./DropdownMenu.js";

type MenubarProps = MenubarPrimitive.Props & IDensityProps;

function Menubar({ density, className, ...props }: MenubarProps): ReactElement {
  return (
    <MenubarPrimitive
      data-density={density}
      data-slot="menubar"
      className={(state) =>
        cn(
          "flex h-control items-center gap-0.5 rounded-sm border p-px",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MenubarMenu<Payload>({
  analytics,
  ...props
}: MenuPrimitive.Root.Props<Payload> & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "MenubarMenu",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return <DropdownMenu data-slot="menubar-menu" {...props} onOpenChange={trackedOnOpenChange} />;
}

function MenubarGroup({ ...props }: ComponentProps<typeof DropdownMenuGroup>): ReactElement {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />;
}

function MenubarPortal({ ...props }: ComponentProps<typeof DropdownMenuPortal>): ReactElement {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />;
}

type MenubarTriggerProps<Payload> = MenuPrimitive.Trigger.Props<Payload> & IDensityProps;

function MenubarTrigger<Payload>({ density, className, ...props }: MenubarTriggerProps<Payload>): ReactElement {
  return (
    <DropdownMenuTrigger
      data-density={density}
      data-slot="menubar-trigger"
      className={(state) =>
        cn(
          "flex h-full items-center rounded-sm px-control-x text-sm leading-none font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MenubarContent({
  density,
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenuPopupProps): ReactElement {
  return (
    <DropdownMenuContent
      density={density}
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={(state) =>
        cn(
          "  min-w-36 rounded-sm bg-popover p-1 text-popover-foreground  border border-frame-edge shadow-frame duration-100       data-open:animate-in data-open:fade-in-0 ",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MenubarItem({
  analytics,
  density,
  className,
  inset,
  variant = "default",
  ...props
}: MenuItemProps & IAnalyticsProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("MenubarItem", analytics, { name: "ui.activate" }, props.onClick);

  return (
    <DropdownMenuItem
      density={density}
      data-slot="menubar-item"
      inset={inset}
      variant={variant}
      className={(state) =>
        cn(
          "group/menubar-item gap-control-gap rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive  data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onClick={trackedOnClick}
    />
  );
}

function MenubarCheckboxItem({
  analytics,
  density,
  className,
  children,
  checked,
  inset,
  ...props
}: MenuCheckboxItemProps & IAnalyticsProps): ReactElement {
  const trackedOnCheckedChange = useAnalyticsCallback(
    "MenubarCheckboxItem",
    analytics,
    { name: "ui.change-request" },
    props.onCheckedChange,
  );

  return (
    <MenuPrimitive.CheckboxItem
      data-density={density}
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pe-1.5 ps-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      checked={checked}
      {...props}
      onCheckedChange={trackedOnCheckedChange}
    >
      <span className="pointer-events-none absolute start-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function MenubarRadioGroup({ ...props }: ComponentProps<typeof DropdownMenuRadioGroup>): ReactElement {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarRadioItem({ density, className, children, inset, ...props }: MenuRadioItemProps): ReactElement {
  return (
    <MenuPrimitive.RadioItem
      data-density={density}
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pe-1.5 ps-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <span className="pointer-events-none absolute start-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function MenubarLabel({ density, className, inset, ...props }: MenuLabelProps): ReactElement {
  return (
    <DropdownMenuLabel
      density={density}
      data-slot="menubar-label"
      inset={inset}
      className={(state) =>
        cn(
          "px-1.5 py-1 text-sm font-medium data-inset:ps-7",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type MenubarSeparatorProps = ComponentProps<typeof DropdownMenuSeparator> & IDensityProps;

function MenubarSeparator({ density, className, ...props }: MenubarSeparatorProps): ReactElement {
  return (
    <DropdownMenuSeparator
      density={density}
      data-slot="menubar-separator"
      className={(state) =>
        cn("-mx-1 my-1 h-px bg-border", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type MenubarShortcutProps = ComponentProps<typeof DropdownMenuShortcut> & IDensityProps;

function MenubarShortcut({ density, className, ...props }: MenubarShortcutProps): ReactElement {
  return (
    <DropdownMenuShortcut
      data-density={density}
      data-slot="menubar-shortcut"
      className={cn(
        "ms-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({ ...props }: ComponentProps<typeof DropdownMenuSub>): ReactElement {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({ density, className, inset, ...props }: MenuSubTriggerProps): ReactElement {
  return (
    <DropdownMenuSubTrigger
      density={density}
      data-slot="menubar-sub-trigger"
      inset={inset}
      className={(state) =>
        cn(
          "gap-control-gap rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MenubarSubContent({ density, className, ...props }: MenuPopupProps): ReactElement {
  return (
    <DropdownMenuSubContent
      density={density}
      data-slot="menubar-sub-content"
      className={(state) =>
        cn(
          "  min-w-32 rounded-sm bg-popover p-1 text-popover-foreground shadow-frame border border-frame-edge border border-frame-edge shadow-frame duration-100     data-open:animate-in data-open:fade-in-0  data-closed:animate-out data-closed:fade-out-0 ",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};

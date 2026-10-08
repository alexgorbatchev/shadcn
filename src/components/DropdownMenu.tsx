"use client";

import { useDensity } from "../hooks/useDensity";
import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../utils/cn";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props): ReactElement | null {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props): ReactElement | null {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props): ReactElement | null {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps;

function DropdownMenuContent({
  density,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: DropdownMenuContentProps): ReactElement | null {
  const resolvedDensity = useDensity(density);

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-density={resolvedDensity}
          data-slot="dropdown-menu-content"
          className={cn(
            "max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-frame border border-frame-edge shadow-frame duration-120 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0",
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props): ReactElement | null {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

type DropdownMenuLabelProps = MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
} & IDensityProps;

function DropdownMenuLabel({ density, className, inset, ...props }: DropdownMenuLabelProps): ReactElement | null {
  return (
    <MenuPrimitive.GroupLabel
      data-density={density}
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className)}
      {...props}
    />
  );
}

type DropdownMenuItemProps = MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
} & IDensityProps;

function DropdownMenuItem({
  density,
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps): ReactElement | null {
  return (
    <MenuPrimitive.Item
      data-density={density}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-control-gap rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props): ReactElement | null {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

type DropdownMenuSubTriggerProps = MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
} & IDensityProps;

function DropdownMenuSubTrigger({
  density,
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps): ReactElement | null {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-density={density}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-control-gap rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

type DropdownMenuSubContentProps = ComponentProps<typeof DropdownMenuContent> & IDensityProps;

function DropdownMenuSubContent({
  density,
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: DropdownMenuSubContentProps): ReactElement | null {
  const resolvedDensity = useDensity(density);

  return (
    <DropdownMenuContent
      data-density={resolvedDensity}
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "w-auto min-w-[96px] rounded-md bg-popover p-1 text-popover-foreground shadow-frame border border-frame-edge shadow-frame duration-120 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

type DropdownMenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
} & IDensityProps;

function DropdownMenuCheckboxItem({
  density,
  className,
  children,
  checked,
  inset,
  ...props
}: DropdownMenuCheckboxItemProps): ReactElement | null {
  return (
    <MenuPrimitive.CheckboxItem
      data-density={density}
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props): ReactElement | null {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

type DropdownMenuRadioItemProps = MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
} & IDensityProps;

function DropdownMenuRadioItem({
  density,
  className,
  children,
  inset,
  ...props
}: DropdownMenuRadioItemProps): ReactElement | null {
  return (
    <MenuPrimitive.RadioItem
      data-density={density}
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

type DropdownMenuSeparatorProps = MenuPrimitive.Separator.Props & IDensityProps;

function DropdownMenuSeparator({ density, className, ...props }: DropdownMenuSeparatorProps): ReactElement | null {
  return (
    <MenuPrimitive.Separator
      data-density={density}
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

type DropdownMenuShortcutProps = ComponentProps<"span"> & IDensityProps;

function DropdownMenuShortcut({ density, className, ...props }: DropdownMenuShortcutProps): ReactElement | null {
  return (
    <span
      data-density={density}
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

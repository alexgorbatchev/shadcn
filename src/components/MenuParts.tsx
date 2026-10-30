"use client";
import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";

import { useDensity } from "../hooks/useDensity.js";
import { MenuPopup as MenuContent } from "./MenuPopup.js";
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
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../utils/cn.js";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

const menuItemClassName =
  "group/menu-item relative flex cursor-default items-center gap-control-gap rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive";

function MenuGroup({ ...props }: MenuPrimitive.Group.Props): ReactElement {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />;
}

function MenuLabel({ density, className, inset, ...props }: MenuLabelProps): ReactElement {
  return (
    <MenuPrimitive.GroupLabel
      data-density={density}
      data-slot="menu-label"
      data-inset={inset}
      className={(state) =>
        cn(
          "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:ps-7",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MenuItem({
  analytics,
  density,
  className,
  inset,
  variant = "default",
  ...props
}: MenuItemProps & IAnalyticsProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("MenuItem", analytics, { name: "ui.activate" }, props.onClick);

  return (
    <MenuPrimitive.Item
      data-density={density}
      data-slot="menu-item"
      data-inset={inset}
      data-variant={variant}
      className={(state) => cn(menuItemClassName, typeof className === "function" ? className(state) : className)}
      {...props}
      onClick={trackedOnClick}
    />
  );
}

type MenuLinkItemProps = MenuPrimitive.LinkItem.Props &
  IDensityProps &
  IAnalyticsProps & { inset?: boolean; variant?: "default" | "destructive" };

function MenuLinkItem({
  analytics,
  density,
  className,
  inset,
  variant = "default",
  ...props
}: MenuLinkItemProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("MenuLinkItem", analytics, { name: "ui.activate" }, props.onClick);
  return (
    <MenuPrimitive.LinkItem
      data-density={density}
      data-slot="menu-item"
      data-inset={inset}
      data-variant={variant}
      className={(state) => cn(menuItemClassName, typeof className === "function" ? className(state) : className)}
      {...props}
      onClick={trackedOnClick}
    />
  );
}

function MenuSub({ analytics, ...props }: MenuPrimitive.SubmenuRoot.Props & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "MenuSub",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return <MenuPrimitive.SubmenuRoot data-slot="menu-sub" {...props} onOpenChange={trackedOnOpenChange} />;
}

function MenuSubTrigger({ density, className, inset, children, ...props }: MenuSubTriggerProps): ReactElement {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-density={density}
      data-slot="menu-sub-trigger"
      data-inset={inset}
      className={(state) =>
        cn(
          "flex cursor-default items-center gap-control-gap rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto rtl:rotate-180" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function MenuSubContent({
  density,
  align = "start",
  alignOffset = -3,
  side = "inline-end",
  sideOffset = 0,
  className,
  ...props
}: MenuPopupProps): ReactElement {
  const resolvedDensity = useDensity(density);

  return (
    <MenuContent
      data-density={resolvedDensity}
      data-slot="menu-sub-content"
      className={(state) =>
        cn(
          "w-auto min-w-[96px] rounded-md bg-popover p-1 text-popover-foreground shadow-frame border border-frame-edge shadow-frame duration-120 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function MenuCheckboxItem({
  analytics,
  density,
  className,
  children,
  checked,
  inset,
  ...props
}: MenuCheckboxItemProps & IAnalyticsProps): ReactElement {
  const trackedOnCheckedChange = useAnalyticsCallback(
    "MenuCheckboxItem",
    analytics,
    { name: "ui.change-request" },
    props.onCheckedChange,
  );

  return (
    <MenuPrimitive.CheckboxItem
      data-density={density}
      data-slot="menu-checkbox-item"
      data-inset={inset}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      checked={checked}
      {...props}
      onCheckedChange={trackedOnCheckedChange}
    >
      <span
        className="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function MenuRadioGroup({ analytics, ...props }: MenuPrimitive.RadioGroup.Props & IAnalyticsProps): ReactElement {
  const trackedOnValueChange = useAnalyticsCallback(
    "MenuRadioGroup",
    analytics,
    { name: "ui.change-request" },
    props.onValueChange,
  );

  return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} onValueChange={trackedOnValueChange} />;
}

function MenuRadioItem({ density, className, children, inset, ...props }: MenuRadioItemProps): ReactElement {
  return (
    <MenuPrimitive.RadioItem
      data-density={density}
      data-slot="menu-radio-item"
      data-inset={inset}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <span
        className="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

type MenuSeparatorProps = MenuPrimitive.Separator.Props & IDensityProps;

function MenuSeparator({ density, className, ...props }: MenuSeparatorProps): ReactElement {
  return (
    <MenuPrimitive.Separator
      data-density={density}
      data-slot="menu-separator"
      className={(state) =>
        cn("-mx-1 my-1 h-px bg-border", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type MenuShortcutProps = ComponentProps<"span"> & IDensityProps;

function MenuShortcut({ density, className, ...props }: MenuShortcutProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="menu-shortcut"
      className={cn(
        "ms-auto text-xs tracking-widest text-muted-foreground group-focus/menu-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuLinkItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
};

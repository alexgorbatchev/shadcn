"use client";

import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import { useDirection } from "./DirectionProvider.js";
import type {
  MenuLabelProps,
  MenuItemProps,
  MenuSubTriggerProps,
  MenuCheckboxItemProps,
  MenuRadioItemProps,
} from "../menu/types.js";
import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../utils/cn.js";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

function DropdownMenu<Payload>({ ...props }: MenuPrimitive.Root.Props<Payload>): ReactElement {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ container, ref, children, ...props }: MenuPrimitive.Portal.Props): ReactElement {
  const resolvedContainer = usePortalContainer(container);
  const portal = usePortalNode(ref);
  return (
    <MenuPrimitive.Portal data-slot="dropdown-menu-portal" container={resolvedContainer} ref={portal.ref} {...props}>
      <PortalProvider container={portal.node}>{children}</PortalProvider>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuTrigger<Payload>({ ...props }: MenuPrimitive.Trigger.Props<Payload>): ReactElement {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps & { width?: "content" | "anchor" };

function DropdownMenuContent({
  density,
  width = "content",
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: DropdownMenuContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();

  return (
    <DropdownMenuPortal>
      <MenuPrimitive.Positioner
        dir={direction}
        className="isolate outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-density={resolvedDensity}
          data-slot="dropdown-menu-content"
          className={(state) =>
            cn(
              "max-h-(--available-height) max-w-(--available-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-frame border border-frame-edge shadow-frame duration-120 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0",
              width === "anchor" ? "w-(--anchor-width)" : "w-max",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        />
      </MenuPrimitive.Positioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props): ReactElement {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({ density, className, inset, ...props }: MenuLabelProps): ReactElement {
  return (
    <MenuPrimitive.GroupLabel
      data-density={density}
      data-slot="dropdown-menu-label"
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

function DropdownMenuItem({ density, className, inset, variant = "default", ...props }: MenuItemProps): ReactElement {
  return (
    <MenuPrimitive.Item
      data-density={density}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={(state) =>
        cn(
          "group/dropdown-menu-item relative flex cursor-default items-center gap-control-gap rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props): ReactElement {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({ density, className, inset, children, ...props }: MenuSubTriggerProps): ReactElement {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-density={density}
      data-slot="dropdown-menu-sub-trigger"
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

type DropdownMenuSubContentProps = ComponentProps<typeof DropdownMenuContent> & IDensityProps;

function DropdownMenuSubContent({
  density,
  align = "start",
  alignOffset = -3,
  side = "inline-end",
  sideOffset = 0,
  className,
  ...props
}: DropdownMenuSubContentProps): ReactElement {
  const resolvedDensity = useDensity(density);

  return (
    <DropdownMenuContent
      data-density={resolvedDensity}
      data-slot="dropdown-menu-sub-content"
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

function DropdownMenuCheckboxItem({
  density,
  className,
  children,
  checked,
  inset,
  ...props
}: MenuCheckboxItemProps): ReactElement {
  return (
    <MenuPrimitive.CheckboxItem
      data-density={density}
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute end-2 flex items-center justify-center"
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

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props): ReactElement {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({ density, className, children, inset, ...props }: MenuRadioItemProps): ReactElement {
  return (
    <MenuPrimitive.RadioItem
      data-density={density}
      data-slot="dropdown-menu-radio-item"
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

function DropdownMenuSeparator({ density, className, ...props }: DropdownMenuSeparatorProps): ReactElement {
  return (
    <MenuPrimitive.Separator
      data-density={density}
      data-slot="dropdown-menu-separator"
      className={(state) =>
        cn("-mx-1 my-1 h-px bg-border", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type DropdownMenuShortcutProps = ComponentProps<"span"> & IDensityProps;

function DropdownMenuShortcut({ density, className, ...props }: DropdownMenuShortcutProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ms-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
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

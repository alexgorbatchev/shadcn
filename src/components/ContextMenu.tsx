import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type {
  MenuLabelProps,
  MenuItemProps,
  MenuSubTriggerProps,
  MenuCheckboxItemProps,
  MenuRadioItemProps,
} from "../menu/types.js";
import type { IDensityProps } from "../density/types.js";
import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import type { ComponentProps, ReactElement } from "react";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

import { useDirection } from "@base-ui/react/direction-provider";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { cn } from "../utils/cn.js";

function ContextMenu({ analytics, ...props }: ContextMenuPrimitive.Root.Props & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "ContextMenu",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} onOpenChange={trackedOnOpenChange} />;
}

function ContextMenuPortal({ container, ref, children, ...props }: ContextMenuPrimitive.Portal.Props): ReactElement {
  const resolvedContainer = usePortalContainer(container);
  const portal = usePortalNode(ref);
  return (
    <ContextMenuPrimitive.Portal
      data-slot="context-menu-portal"
      container={resolvedContainer}
      ref={portal.ref}
      {...props}
    >
      <PortalProvider container={portal.node}>{children}</PortalProvider>
    </ContextMenuPrimitive.Portal>
  );
}

type ContextMenuTriggerProps = ContextMenuPrimitive.Trigger.Props & IDensityProps;

function ContextMenuTrigger({ density, className, ...props }: ContextMenuTriggerProps): ReactElement {
  return (
    <ContextMenuPrimitive.Trigger
      data-density={density}
      data-slot="context-menu-trigger"
      className={(state) => cn("select-none", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

type ContextMenuContentProps = ContextMenuPrimitive.Popup.Props &
  Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps;

function ContextMenuContent({
  density,
  className,
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 0,
  ...props
}: ContextMenuContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Positioner
        dir={direction}
        className="isolate  outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          dir={direction}
          data-density={resolvedDensity}
          data-slot="context-menu-content"
          className={(state) =>
            cn(
              "   max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover p-1 text-popover-foreground  border border-frame-edge shadow-frame duration-100 outline-none       data-open:animate-in data-open:fade-in-0  data-closed:animate-out data-closed:fade-out-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none ",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPortal>
  );
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props): ReactElement {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel({ density, className, inset, ...props }: MenuLabelProps): ReactElement {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-density={density}
      data-slot="context-menu-label"
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

function ContextMenuItem({
  analytics,
  density,
  className,
  inset,
  variant = "default",
  ...props
}: MenuItemProps & IAnalyticsProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("ContextMenuItem", analytics, { name: "ui.activate" }, props.onClick);

  return (
    <ContextMenuPrimitive.Item
      data-density={density}
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={(state) =>
        cn(
          "group/context-menu-item relative flex cursor-default items-center gap-control-gap rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive  data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onClick={trackedOnClick}
    />
  );
}

function ContextMenuSub({
  analytics,
  ...props
}: ContextMenuPrimitive.SubmenuRoot.Props & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "ContextMenuSub",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return (
    <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} onOpenChange={trackedOnOpenChange} />
  );
}

function ContextMenuSubTrigger({ density, className, inset, children, ...props }: MenuSubTriggerProps): ReactElement {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-density={density}
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={(state) =>
        cn(
          "flex cursor-default items-center gap-control-gap rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
      <ChevronRightIcon className="rtl:rotate-180 ms-auto" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({ ...props }: ComponentProps<typeof ContextMenuContent>): ReactElement {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      className="  shadow-frame border border-frame-edge"
      side="inline-end"
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  analytics,
  density,
  className,
  children,
  checked,
  inset,
  ...props
}: MenuCheckboxItemProps & IAnalyticsProps): ReactElement {
  const trackedOnCheckedChange = useAnalyticsCallback(
    "ContextMenuCheckboxItem",
    analytics,
    { name: "ui.change-request" },
    props.onCheckedChange,
  );

  return (
    <ContextMenuPrimitive.CheckboxItem
      data-density={density}
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      checked={checked}
      {...props}
      onCheckedChange={trackedOnCheckedChange}
    >
      <span className="pointer-events-none absolute end-2">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup({
  analytics,
  ...props
}: ContextMenuPrimitive.RadioGroup.Props & IAnalyticsProps): ReactElement {
  const trackedOnValueChange = useAnalyticsCallback(
    "ContextMenuRadioGroup",
    analytics,
    { name: "ui.change-request" },
    props.onValueChange,
  );

  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
      onValueChange={trackedOnValueChange}
    />
  );
}

function ContextMenuRadioItem({ density, className, children, inset, ...props }: MenuRadioItemProps): ReactElement {
  return (
    <ContextMenuPrimitive.RadioItem
      data-density={density}
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-control-gap rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <span className="pointer-events-none absolute end-2">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

type ContextMenuSeparatorProps = ContextMenuPrimitive.Separator.Props & IDensityProps;

function ContextMenuSeparator({ density, className, ...props }: ContextMenuSeparatorProps): ReactElement {
  return (
    <ContextMenuPrimitive.Separator
      data-density={density}
      data-slot="context-menu-separator"
      className={(state) =>
        cn("-mx-1 my-1 h-px bg-border", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type ContextMenuShortcutProps = ComponentProps<"span"> & IDensityProps;

function ContextMenuShortcut({ density, className, ...props }: ContextMenuShortcutProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="context-menu-shortcut"
      className={cn(
        "ms-auto text-xs tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

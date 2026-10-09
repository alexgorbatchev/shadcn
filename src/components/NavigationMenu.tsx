import type { IDensityProps } from "../density/types";
import { useDensity } from "../hooks/useDensity";
import { useDirection } from "./DirectionProvider";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { ChevronDownIcon } from "lucide-react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";

type NavigationMenuProps<Value> = NavigationMenuPrimitive.Root.Props<Value> &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> &
  IDensityProps;

function NavigationMenu<Value>({
  density,
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuProps<Value>): ReactElement | null {
  const resolvedDensity = useDensity(density);
  return (
    <NavigationMenuPrimitive.Root
      data-density={resolvedDensity}
      data-slot="navigation-menu"
      className={(state) =>
        cn(
          "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
      <NavigationMenuPositioner density={resolvedDensity} align={align} />
    </NavigationMenuPrimitive.Root>
  );
}

type NavigationMenuListProps = ComponentPropsWithRef<typeof NavigationMenuPrimitive.List> & IDensityProps;

function NavigationMenuList({ density, className, ...props }: NavigationMenuListProps): ReactElement | null {
  return (
    <NavigationMenuPrimitive.List
      data-density={density}
      data-slot="navigation-menu-list"
      className={(state) =>
        cn(
          "group flex flex-1 list-none items-center justify-center gap-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type NavigationMenuItemProps = ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item> & IDensityProps;

function NavigationMenuItem({ density, className, ...props }: NavigationMenuItemProps): ReactElement | null {
  return (
    <NavigationMenuPrimitive.Item
      data-density={density}
      data-slot="navigation-menu-item"
      className={(state) => cn("relative", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-control-lg w-max items-center justify-center rounded-sm px-control-x py-1.5 text-sm font-medium transition-colors outline-none hover:bg-muted focus:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted",
);

type NavigationMenuTriggerProps = NavigationMenuPrimitive.Trigger.Props & IDensityProps;

function NavigationMenuTrigger({
  density,
  className,
  children,
  ...props
}: NavigationMenuTriggerProps): ReactElement | null {
  return (
    <NavigationMenuPrimitive.Trigger
      data-density={density}
      data-slot="navigation-menu-trigger"
      className={(state) =>
        cn(navigationMenuTriggerStyle(), "group", typeof className === "function" ? className(state) : className)
      }
      {...props}
    >
      {children} <NavigationMenuIndicator />
    </NavigationMenuPrimitive.Trigger>
  );
}

type NavigationMenuContentProps = NavigationMenuPrimitive.Content.Props & IDensityProps;

function NavigationMenuContent({ density, className, ...props }: NavigationMenuContentProps): ReactElement | null {
  return (
    <NavigationMenuPrimitive.Content
      data-density={density}
      data-slot="navigation-menu-content"
      className={(state) =>
        cn(
          "data-ending-style:data-activation-direction=left:translate-x-[50%] data-ending-style:data-activation-direction=right:translate-x-[-50%] data-starting-style:data-activation-direction=left:translate-x-[-50%] data-starting-style:data-activation-direction=right:translate-x-[50%] h-full w-auto p-1 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]        data-ending-style:opacity-0 data-starting-style:opacity-0                ",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type NavigationMenuPositionerProps = NavigationMenuPrimitive.Positioner.Props & IDensityProps;

function NavigationMenuPositioner({
  density,
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPositionerProps): ReactElement | null {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        dir={direction}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={(state) =>
          cn(
            "isolate  h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0",
            typeof className === "function" ? className(state) : className,
          )
        }
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          data-density={resolvedDensity}
          data-slot="navigation-menu-popup"
          className="data-[ending-style]:easing-[ease] xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-sm bg-popover text-popover-foreground border border-frame-edge shadow-frame transition-[opacity,transform,width,height,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none  data-ending-style:opacity-0 data-ending-style:duration-150  data-starting-style:opacity-0"
        >
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

type NavigationMenuLinkProps = NavigationMenuPrimitive.Link.Props & IDensityProps;

function NavigationMenuLink({ density, className, ...props }: NavigationMenuLinkProps): ReactElement | null {
  return (
    <NavigationMenuPrimitive.Link
      data-density={density}
      data-slot="navigation-menu-link"
      className={(state) =>
        cn(
          "flex items-center gap-2 rounded-sm p-2 text-sm transition-colors outline-none hover:bg-muted focus:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type NavigationMenuIndicatorProps = ComponentPropsWithRef<typeof NavigationMenuPrimitive.Icon> & IDensityProps;

function NavigationMenuIndicator({
  density,
  className,
  children,
  ...props
}: NavigationMenuIndicatorProps): ReactElement | null {
  return (
    <NavigationMenuPrimitive.Icon
      data-density={density}
      data-slot="navigation-menu-indicator"
      className={(state) =>
        cn(
          "ms-1 inline-flex size-3 shrink-0 items-center justify-center transition-transform duration-120 data-popup-open:rotate-180 [&_svg]:size-full",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children ?? <ChevronDownIcon />}
    </NavigationMenuPrimitive.Icon>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
};

import type { IDensityProps } from "../density/types.js";
import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import type { ComponentProps, ReactElement } from "react";
import { useMemo } from "react";
import { DrawerContext } from "../drawer/DrawerContext.js";
import { useDrawer } from "../hooks/useDrawer.js";
import { useDirection } from "./DirectionProvider.js";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "../utils/cn.js";

type DrawerProps<Payload> = DrawerPrimitive.Root.Props<Payload> & { showSwipeHandle?: boolean };

function Drawer<Payload>({
  modal = true,
  showSwipeHandle = false,
  snapPoints,
  swipeDirection = "down",
  ...props
}: DrawerProps<Payload>): ReactElement {
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const contextValue = useMemo(
    () => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection }),
    [hasSnapPoints, modal, showSwipeHandle, swipeDirection],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive.Root<Payload>
        data-slot="drawer"
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

function DrawerTrigger<Payload>({ ...props }: DrawerPrimitive.Trigger.Props<Payload>): ReactElement {
  return <DrawerPrimitive.Trigger<Payload> data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ container, ref, children, ...props }: DrawerPrimitive.Portal.Props): ReactElement {
  const resolvedContainer = usePortalContainer(container);
  const portal = usePortalNode(ref);
  return (
    <DrawerPrimitive.Portal data-slot="drawer-portal" container={resolvedContainer} ref={portal.ref} {...props}>
      <PortalProvider container={portal.node}>{children}</PortalProvider>
    </DrawerPrimitive.Portal>
  );
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props): ReactElement {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

type DrawerOverlayProps = DrawerPrimitive.Backdrop.Props & IDensityProps;

function DrawerOverlay({ density, className, ...props }: DrawerOverlayProps): ReactElement {
  const resolvedDensity = useDensity(density);

  return (
    <DrawerPrimitive.Backdrop
      data-density={resolvedDensity}
      data-slot="drawer-overlay"
      className={(state) =>
        cn(
          "fixed inset-0  min-h-dvh bg-backdrop opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-snap-points:[--drawer-overlay-min-opacity:0.5] data-starting-style:opacity-0 data-swiping:duration-0  supports-[-webkit-touch-callout:none]:absolute",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type DrawerSwipeHandleProps = ComponentProps<"div"> & IDensityProps;

function DrawerSwipeHandle({ density, className, ...props }: DrawerSwipeHandleProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      className={cn(
        "relative  flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-[swipe-axis=x]/drawer-popup:h-full group-data-[swipe-axis=x]/drawer-popup:w-3 group-data-[swipe-axis=x]/drawer-popup:items-center group-data-[swipe-axis=y]/drawer-popup:h-3 group-data-[swipe-axis=y]/drawer-popup:w-full group-data-[swipe-axis=y]/drawer-popup:justify-center group-data-[swipe-direction=down]/drawer-popup:items-end group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:justify-start group-data-[swipe-direction=right]/drawer-popup:justify-end group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:items-start after:block after:shrink-0 after:rounded-full after:bg-muted group-data-[swipe-axis=x]/drawer-popup:after:h-24 group-data-[swipe-axis=x]/drawer-popup:after:w-1 group-data-[swipe-axis=y]/drawer-popup:after:h-1 group-data-[swipe-axis=y]/drawer-popup:after:w-24 active:cursor-grabbing",
        className,
      )}
      {...props}
    />
  );
}

type DrawerContentProps = DrawerPrimitive.Popup.Props & IDensityProps;

function DrawerContent({ density, className, children, ...props }: DrawerContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();

  const { hasSnapPoints, modal, showSwipeHandle, swipeDirection } = useDrawer();
  const swipeAxis = swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";

  return (
    <DrawerPortal data-slot="drawer-portal">
      {modal === true && <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} />}
      <DrawerPrimitive.Viewport
        dir={direction}
        data-slot="drawer-viewport"
        data-modal={modal}
        className="pointer-events-none fixed inset-0  select-none data-[modal=true]:pointer-events-auto"
      >
        <DrawerPrimitive.Popup
          data-density={resolvedDensity}
          data-slot="drawer-popup"
          data-swipe-axis={swipeAxis}
          data-snap-points={hasSnapPoints ? "" : undefined}
          className={(state) =>
            cn(
              // Base.
              "group/drawer-popup pointer-events-auto fixed  m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)] flex-col border border-frame-edge shadow-frame bg-popover text-sm text-popover-foreground transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [interpolate-size:allow-keywords] data-[swipe-direction=down]:rounded-t-md data-[swipe-direction=down]:border-t data-[swipe-direction=left]:rounded-r-md data-[swipe-direction=left]:border-r data-[swipe-direction=right]:rounded-l-md data-[swipe-direction=right]:border-l data-[swipe-direction=up]:rounded-b-md data-[swipe-direction=up]:border-b",
              // Nested.
              "data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95",
              // Bleed.
              "after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full",
              // Sizing.
              "[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]",
              // Stack.
              "[--bleed:3rem] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-shrink:0]",
              // Transitions.
              "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:transform-(--closed-transform) data-swiping:duration-0 data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
              // Axis: y.
              "data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:data-nested-drawer-open:h-(--stack-height)",
              // Axis: x.
              "data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row",
              // Direction: down.
              "data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]",
              // Direction: up.
              "data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]",
              // Direction: left.
              "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]",
              // Direction: right.
              "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        >
          {showSwipeHandle && <DrawerSwipeHandle />}
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-out select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none"
          >
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

type DrawerHeaderProps = ComponentProps<"div"> & IDensityProps;

function DrawerHeader({ density, className, ...props }: DrawerHeaderProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="drawer-header"
      className={cn(
        "flex shrink-0 flex-col gap-0.5 p-panel pb-0 group-data-[swipe-axis=y]/drawer-popup:text-center md:gap-0.5 md:text-start md:group-data-[swipe-axis=y]/drawer-popup:text-start",
        className,
      )}
      {...props}
    />
  );
}

type DrawerFooterProps = ComponentProps<"div"> & IDensityProps;

function DrawerFooter({ density, className, ...props }: DrawerFooterProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="drawer-footer"
      className={cn("mt-auto flex shrink-0 flex-col gap-2 p-panel pt-0", className)}
      {...props}
    />
  );
}

type DrawerTitleProps = DrawerPrimitive.Title.Props & IDensityProps;

function DrawerTitle({ density, className, ...props }: DrawerTitleProps): ReactElement {
  return (
    <DrawerPrimitive.Title
      data-density={density}
      data-slot="drawer-title"
      className={(state) =>
        cn(" text-base font-medium text-foreground", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type DrawerDescriptionProps = DrawerPrimitive.Description.Props & IDensityProps;

function DrawerDescription({ density, className, ...props }: DrawerDescriptionProps): ReactElement {
  return (
    <DrawerPrimitive.Description
      data-density={density}
      data-slot="drawer-description"
      className={(state) =>
        cn("text-sm text-balance text-muted-foreground", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

import type { IDensityProps } from "../density/types.js";
import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import type { ComponentProps, ReactElement } from "react";
import { XIcon } from "lucide-react";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { cn } from "../utils/cn.js";

import { Button } from "./Button.js";
import { useDirection } from "./DirectionProvider.js";

function Sheet<Payload>({ ...props }: SheetPrimitive.Root.Props<Payload>): ReactElement {
  return <SheetPrimitive.Root<Payload> data-slot="sheet" {...props} />;
}

function SheetTrigger<Payload>({ ...props }: SheetPrimitive.Trigger.Props<Payload>): ReactElement {
  return <SheetPrimitive.Trigger<Payload> data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props): ReactElement {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ container, ref, children, ...props }: SheetPrimitive.Portal.Props): ReactElement {
  const resolvedContainer = usePortalContainer(container);
  const portal = usePortalNode(ref);
  return (
    <SheetPrimitive.Portal data-slot="sheet-portal" container={resolvedContainer} ref={portal.ref} {...props}>
      <PortalProvider container={portal.node}>{children}</PortalProvider>
    </SheetPrimitive.Portal>
  );
}

type SheetOverlayProps = SheetPrimitive.Backdrop.Props & IDensityProps;

function SheetOverlay({ density, className, ...props }: SheetOverlayProps): ReactElement {
  const resolvedDensity = useDensity(density);

  return (
    <SheetPrimitive.Backdrop
      data-density={resolvedDensity}
      data-slot="sheet-overlay"
      className={(state) =>
        cn(
          "fixed inset-0  bg-backdrop transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type SheetContentProps = SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
} & IDensityProps;

function SheetContent({
  density,
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        dir={direction}
        data-density={resolvedDensity}
        data-slot="sheet-content"
        data-side={side}
        className={(state) =>
          cn(
            "fixed  flex flex-col gap-panel bg-popover bg-clip-padding text-sm text-popover-foreground shadow-frame border border-frame-edge transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
            typeof className === "function" ? className(state) : className,
          )
        }
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={<Button variant="ghost" className="absolute top-3 end-3" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

type SheetHeaderProps = ComponentProps<"div"> & IDensityProps;

function SheetHeader({ density, className, ...props }: SheetHeaderProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-panel", className)}
      {...props}
    />
  );
}

type SheetFooterProps = ComponentProps<"div"> & IDensityProps;

function SheetFooter({ density, className, ...props }: SheetFooterProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-panel", className)}
      {...props}
    />
  );
}

type SheetTitleProps = SheetPrimitive.Title.Props & IDensityProps;

function SheetTitle({ density, className, ...props }: SheetTitleProps): ReactElement {
  return (
    <SheetPrimitive.Title
      data-density={density}
      data-slot="sheet-title"
      className={(state) =>
        cn(" text-base font-medium text-foreground", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type SheetDescriptionProps = SheetPrimitive.Description.Props & IDensityProps;

function SheetDescription({ density, className, ...props }: SheetDescriptionProps): ReactElement {
  return (
    <SheetPrimitive.Description
      data-density={density}
      data-slot="sheet-description"
      className={(state) =>
        cn("text-sm text-muted-foreground", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };

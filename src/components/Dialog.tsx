import { useDensity } from "../hooks/useDensity";
import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "../utils/cn";

import { Button } from "./Button";
import { XIcon } from "lucide-react";

function Dialog({ ...props }: DialogPrimitive.Root.Props): ReactElement | null {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props): ReactElement | null {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props): ReactElement | null {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props): ReactElement | null {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

type DialogOverlayProps = DialogPrimitive.Backdrop.Props & IDensityProps;

function DialogOverlay({ density, className, ...props }: DialogOverlayProps): ReactElement | null {
  const resolvedDensity = useDensity(density);

  return (
    <DialogPrimitive.Backdrop
      data-density={resolvedDensity}
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate bg-backdrop duration-120 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

type DialogContentProps = DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
} & IDensityProps;

function DialogContent({
  density,
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps): ReactElement | null {
  const resolvedDensity = useDensity(density);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-density={resolvedDensity}
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-panel rounded-md bg-popover p-panel text-sm text-popover-foreground border border-frame-edge shadow-frame duration-120 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" className="absolute top-2 right-2" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

type DialogHeaderProps = ComponentProps<"div"> & IDensityProps;

function DialogHeader({ density, className, ...props }: DialogHeaderProps): ReactElement | null {
  return (
    <div data-density={density} data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

type DialogFooterProps = ComponentProps<"div"> & {
  showCloseButton?: boolean;
} & IDensityProps;

function DialogFooter({
  density,
  className,
  showCloseButton = false,
  children,
  ...props
}: DialogFooterProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="dialog-footer"
      className={cn(
        "-mx-panel -mb-panel flex flex-col-reverse gap-2 rounded-b-md border-t bg-muted/50 p-panel sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && <DialogPrimitive.Close render={<Button variant="outline" />}>Close</DialogPrimitive.Close>}
    </div>
  );
}

type DialogTitleProps = DialogPrimitive.Title.Props & IDensityProps;

function DialogTitle({ density, className, ...props }: DialogTitleProps): ReactElement | null {
  return (
    <DialogPrimitive.Title
      data-density={density}
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  );
}

type DialogDescriptionProps = DialogPrimitive.Description.Props & IDensityProps;

function DialogDescription({ density, className, ...props }: DialogDescriptionProps): ReactElement | null {
  return (
    <DialogPrimitive.Description
      data-density={density}
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

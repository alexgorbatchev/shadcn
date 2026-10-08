"use client";

import { useDensity } from "../hooks/useDensity";
import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { cn } from "../utils/cn";

import { Button } from "./Button";

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props): ReactElement | null {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props): ReactElement | null {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props): ReactElement | null {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

type AlertDialogOverlayProps = AlertDialogPrimitive.Backdrop.Props & IDensityProps;

function AlertDialogOverlay({ density, className, ...props }: AlertDialogOverlayProps): ReactElement | null {
  const resolvedDensity = useDensity(density);

  return (
    <AlertDialogPrimitive.Backdrop
      data-density={resolvedDensity}
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate bg-backdrop duration-120 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

type AlertDialogContentProps = AlertDialogPrimitive.Popup.Props & {
  size?: "default" | "sm";
} & IDensityProps;

function AlertDialogContent({
  density,
  className,
  size = "default",
  ...props
}: AlertDialogContentProps): ReactElement | null {
  const resolvedDensity = useDensity(density);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-density={resolvedDensity}
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 grid w-full -translate-x-1/2 -translate-y-1/2 gap-panel rounded-md bg-popover p-panel text-popover-foreground border border-frame-edge shadow-frame duration-120 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

type AlertDialogHeaderProps = ComponentProps<"div"> & IDensityProps;

function AlertDialogHeader({ density, className, ...props }: AlertDialogHeaderProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-control-gap text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className,
      )}
      {...props}
    />
  );
}

type AlertDialogFooterProps = ComponentProps<"div"> & IDensityProps;

function AlertDialogFooter({ density, className, ...props }: AlertDialogFooterProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-panel -mb-panel flex flex-col-reverse gap-2 rounded-b-md border-t bg-muted/50 p-panel group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

type AlertDialogMediaProps = ComponentProps<"div"> & IDensityProps;

function AlertDialogMedia({ density, className, ...props }: AlertDialogMediaProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-control-xs",
        className,
      )}
      {...props}
    />
  );
}

type AlertDialogTitleProps = ComponentProps<typeof AlertDialogPrimitive.Title> & IDensityProps;

function AlertDialogTitle({ density, className, ...props }: AlertDialogTitleProps): ReactElement | null {
  return (
    <AlertDialogPrimitive.Title
      data-density={density}
      data-slot="alert-dialog-title"
      className={cn(
        "text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className,
      )}
      {...props}
    />
  );
}

type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogPrimitive.Description> & IDensityProps;

function AlertDialogDescription({ density, className, ...props }: AlertDialogDescriptionProps): ReactElement | null {
  return (
    <AlertDialogPrimitive.Description
      data-density={density}
      data-slot="alert-dialog-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

type AlertDialogActionProps = ComponentProps<typeof Button> & IDensityProps;

function AlertDialogAction({ density, className, ...props }: AlertDialogActionProps): ReactElement | null {
  return <Button data-density={density} data-slot="alert-dialog-action" className={cn(className)} {...props} />;
}

type AlertDialogCancelProps = AlertDialogPrimitive.Close.Props &
  Pick<ComponentProps<typeof Button>, "variant" | "size"> &
  IDensityProps;

function AlertDialogCancel({
  density,
  className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogCancelProps): ReactElement | null {
  return (
    <AlertDialogPrimitive.Close
      data-density={density}
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};

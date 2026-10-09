"use client";

import { useDensity } from "../hooks/useDensity";
import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "../utils/cn";

function Popover<Payload>({ ...props }: PopoverPrimitive.Root.Props<Payload>): ReactElement | null {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger<Payload>({ ...props }: PopoverPrimitive.Trigger.Props<Payload>): ReactElement | null {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps;

function PopoverContent({
  density,
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps): ReactElement | null {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        dir={direction}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate "
      >
        <PopoverPrimitive.Popup
          dir={direction}
          data-density={resolvedDensity}
          data-slot="popover-content"
          className={(state) =>
            cn(
              "flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-md bg-popover p-2.5 text-sm text-popover-foreground shadow-frame border border-frame-edge shadow-frame outline-hidden duration-120 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

type PopoverHeaderProps = ComponentProps<"div"> & IDensityProps;

function PopoverHeader({ density, className, ...props }: PopoverHeaderProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  );
}

type PopoverTitleProps = PopoverPrimitive.Title.Props & IDensityProps;

function PopoverTitle({ density, className, ...props }: PopoverTitleProps): ReactElement | null {
  return (
    <PopoverPrimitive.Title
      data-density={density}
      data-slot="popover-title"
      className={(state) => cn("font-medium", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

type PopoverDescriptionProps = PopoverPrimitive.Description.Props & IDensityProps;

function PopoverDescription({ density, className, ...props }: PopoverDescriptionProps): ReactElement | null {
  return (
    <PopoverPrimitive.Description
      data-density={density}
      data-slot="popover-description"
      className={(state) => cn("text-muted-foreground", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger };

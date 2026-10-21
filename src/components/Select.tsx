"use client";

import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { useDirection } from "@base-ui/react/direction-provider";
import { cn } from "../utils/cn.js";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";

const Select = SelectPrimitive.Root;

type SelectGroupProps = SelectPrimitive.Group.Props & IDensityProps;

function SelectGroup({ density, className, ...props }: SelectGroupProps): ReactElement {
  return (
    <SelectPrimitive.Group
      data-density={density}
      data-slot="select-group"
      className={(state) => cn("scroll-my-1 p-1", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

type SelectValueProps = SelectPrimitive.Value.Props & IDensityProps;

function SelectValue({ density, className, ...props }: SelectValueProps): ReactElement {
  return (
    <SelectPrimitive.Value
      data-density={density}
      data-slot="select-value"
      className={(state) =>
        cn("flex flex-1 text-start", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
} & IDensityProps;

function SelectTrigger({ density, className, size = "default", children, ...props }: SelectTriggerProps): ReactElement {
  return (
    <SelectPrimitive.Trigger
      data-density={density}
      data-slot="select-trigger"
      data-size={size}
      className={(state) =>
        cn(
          "flex w-fit items-center justify-between gap-control-gap rounded-sm border border-input bg-transparent py-2 pe-2 ps-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive data-placeholder:text-muted-foreground data-[size=default]:h-control data-[size=sm]:h-control-sm data-[size=sm]:rounded-sm *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-control-gap [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
      <SelectPrimitive.Icon render={<ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />} />
    </SelectPrimitive.Trigger>
  );
}

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"> &
  IDensityProps;

function SelectContent({
  density,
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();
  const container = usePortalContainer();

  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate "
      >
        <SelectPrimitive.Popup
          dir={direction}
          data-density={resolvedDensity}
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={(state) =>
            cn(
              "relative isolate max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover text-popover-foreground border border-frame-edge shadow-frame duration-120 data-[align-trigger=true]:animate-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

type SelectLabelProps = SelectPrimitive.GroupLabel.Props & IDensityProps;

function SelectLabel({ density, className, ...props }: SelectLabelProps): ReactElement {
  return (
    <SelectPrimitive.GroupLabel
      data-density={density}
      data-slot="select-label"
      className={(state) =>
        cn("px-1.5 py-1 text-xs text-muted-foreground", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type SelectItemProps = SelectPrimitive.Item.Props & IDensityProps;

function SelectItem({ density, className, children, ...props }: SelectItemProps): ReactElement {
  return (
    <SelectPrimitive.Item
      data-density={density}
      data-slot="select-item"
      className={(state) =>
        cn(
          "relative flex w-full cursor-default items-center gap-control-gap rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={<span className="pointer-events-none absolute end-2 flex size-4 items-center justify-center" />}
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

type SelectSeparatorProps = SelectPrimitive.Separator.Props & IDensityProps;

function SelectSeparator({ density, className, ...props }: SelectSeparatorProps): ReactElement {
  return (
    <SelectPrimitive.Separator
      data-density={density}
      data-slot="select-separator"
      className={(state) =>
        cn(
          "pointer-events-none -mx-1 my-1 h-px bg-border",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type SelectScrollUpButtonProps = ComponentProps<typeof SelectPrimitive.ScrollUpArrow> & IDensityProps;

function SelectScrollUpButton({ density, className, ...props }: SelectScrollUpButtonProps): ReactElement {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-density={density}
      data-slot="select-scroll-up-button"
      className={(state) =>
        cn(
          "top-0 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

type SelectScrollDownButtonProps = ComponentProps<typeof SelectPrimitive.ScrollDownArrow> & IDensityProps;

function SelectScrollDownButton({ density, className, ...props }: SelectScrollDownButtonProps): ReactElement {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-density={density}
      data-slot="select-scroll-down-button"
      className={(state) =>
        cn(
          "bottom-0 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

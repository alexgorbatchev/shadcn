import { useDensity } from "../hooks/useDensity.js";
import type { IDensityProps } from "../density/types.js";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cn } from "../utils/cn.js";

import { Button } from "./Button.js";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./InputGroup.js";
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react";

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props): ReactElement {
  return <ComboboxPrimitive.Value {...props} />;
}

type ComboboxTriggerProps = ComboboxPrimitive.Trigger.Props & IDensityProps;

function ComboboxTrigger({ density, className, children, ...props }: ComboboxTriggerProps): ReactElement {
  return (
    <ComboboxPrimitive.Trigger
      data-density={density}
      data-slot="combobox-trigger"
      className={(state) =>
        cn("[&_svg:not([class*='size-'])]:size-4", typeof className === "function" ? className(state) : className)
      }
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

type ComboboxClearProps = ComboboxPrimitive.Clear.Props & IDensityProps;

function ComboboxClear({ density, className, ...props }: ComboboxClearProps): ReactElement {
  return (
    <ComboboxPrimitive.Clear
      data-density={density}
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={(state) => cn(typeof className === "function" ? className(state) : className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

type ComboboxInputProps = ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
  frameClassName?: string;
  triggerLabel?: string;
  clearLabel?: string;
} & IDensityProps;

function ComboboxInput({
  density,
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  frameClassName,
  triggerLabel = "Open popup",
  clearLabel = "Clear selection",
  ...props
}: ComboboxInputProps): ReactElement {
  return (
    <InputGroup density={density} className={cn("w-auto", frameClassName)}>
      <ComboboxPrimitive.Input disabled={disabled} className={className} render={<InputGroupInput />} {...props} />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={<ComboboxTrigger />}
            aria-label={triggerLabel}
            data-density={density}
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} aria-label={clearLabel} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

type ComboboxContentProps = ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "anchor"> &
  IDensityProps;

function ComboboxContent({
  density,
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();

  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate "
      >
        <ComboboxPrimitive.Popup
          dir={direction}
          data-density={resolvedDensity}
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={(state) =>
            cn(
              "group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground border border-frame-edge shadow-frame duration-120 data-[chips=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-control *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

type ComboboxListProps = ComboboxPrimitive.List.Props & IDensityProps;

function ComboboxList({ density, className, ...props }: ComboboxListProps): ReactElement {
  return (
    <ComboboxPrimitive.List
      data-density={density}
      data-slot="combobox-list"
      className={(state) =>
        cn(
          "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type ComboboxItemProps = ComboboxPrimitive.Item.Props & IDensityProps;

function ComboboxItem({ density, className, children, ...props }: ComboboxItemProps): ReactElement {
  return (
    <ComboboxPrimitive.Item
      data-density={density}
      data-slot="combobox-item"
      className={(state) =>
        cn(
          "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={<span className="pointer-events-none absolute end-2 flex size-4 items-center justify-center" />}
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

type ComboboxGroupProps = ComboboxPrimitive.Group.Props & IDensityProps;

function ComboboxGroup({ density, className, ...props }: ComboboxGroupProps): ReactElement {
  return (
    <ComboboxPrimitive.Group
      data-density={density}
      data-slot="combobox-group"
      className={(state) => cn(typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

type ComboboxLabelProps = ComboboxPrimitive.GroupLabel.Props & IDensityProps;

function ComboboxLabel({ density, className, ...props }: ComboboxLabelProps): ReactElement {
  return (
    <ComboboxPrimitive.GroupLabel
      data-density={density}
      data-slot="combobox-label"
      className={(state) =>
        cn("px-2 py-1.5 text-xs text-muted-foreground", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props): ReactElement {
  return <ComboboxPrimitive.Collection {...props} />;
}

type ComboboxEmptyProps = ComboboxPrimitive.Empty.Props & IDensityProps;

function ComboboxEmpty({ density, className, ...props }: ComboboxEmptyProps): ReactElement {
  return (
    <ComboboxPrimitive.Empty
      data-density={density}
      data-slot="combobox-empty"
      className={(state) =>
        cn(
          "flex w-full justify-center py-2 empty:p-0 text-center text-sm text-muted-foreground",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type ComboboxSeparatorProps = ComboboxPrimitive.Separator.Props & IDensityProps;

function ComboboxSeparator({ density, className, ...props }: ComboboxSeparatorProps): ReactElement {
  return (
    <ComboboxPrimitive.Separator
      data-density={density}
      data-slot="combobox-separator"
      className={(state) =>
        cn("-mx-1 my-1 h-px bg-border", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type ComboboxChipsProps = ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props &
  IDensityProps;

function ComboboxChips({ density, className, ...props }: ComboboxChipsProps): ReactElement {
  return (
    <ComboboxPrimitive.Chips
      data-density={density}
      data-slot="combobox-chips"
      className={(state) =>
        cn(
          "flex min-h-control flex-wrap items-center gap-1 rounded-sm border border-input bg-transparent bg-clip-padding px-control-x py-px text-sm transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive has-data-[slot=combobox-chip]:px-1",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type ComboboxChipProps = ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
} & IDensityProps;

function ComboboxChip({ density, className, children, showRemove = true, ...props }: ComboboxChipProps): ReactElement {
  return (
    <ComboboxPrimitive.Chip
      data-density={density}
      data-slot="combobox-chip"
      className={(state) =>
        cn(
          "flex h-tag w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pe-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="size-tag -ms-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          aria-label="Remove item"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

type ComboboxChipsInputProps = ComboboxPrimitive.Input.Props & IDensityProps;

function ComboboxChipsInput({ density, className, ...props }: ComboboxChipsInputProps): ReactElement {
  return (
    <ComboboxPrimitive.Input
      data-density={density}
      data-slot="combobox-chip-input"
      className={(state) =>
        cn(
          "h-tag min-w-16 flex-1 py-0 text-sm leading-none outline-none",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
};

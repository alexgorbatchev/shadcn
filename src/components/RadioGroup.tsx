"use client";

import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "../utils/cn";

type RadioGroupProps = RadioGroupPrimitive.Props & IDensityProps;

function RadioGroup({ density, className, ...props }: RadioGroupProps): ReactElement | null {
  return (
    <RadioGroupPrimitive
      data-density={density}
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

type RadioGroupItemProps = RadioPrimitive.Root.Props & IDensityProps;

function RadioGroupItem({ density, className, ...props }: RadioGroupItemProps): ReactElement | null {
  return (
    <RadioPrimitive.Root
      data-density={density}
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-group-indicator" className="flex size-4 items-center justify-center">
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };

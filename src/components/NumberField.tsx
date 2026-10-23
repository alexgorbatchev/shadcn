import { useDensity } from "../hooks/useDensity.js";
import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { cn } from "../utils/cn.js";
import { MinusIcon, PlusIcon, MoveHorizontalIcon } from "lucide-react";

function NumberField({ density, className, ...props }: NumberFieldPrimitive.Root.Props & IDensityProps): ReactElement {
  return (
    <NumberFieldPrimitive.Root
      data-density={density}
      data-slot="number-field"
      className={(state) =>
        cn("flex min-w-0 flex-col gap-field-gap", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

function NumberFieldGroup({
  density,
  className,
  ...props
}: NumberFieldPrimitive.Group.Props & IDensityProps): ReactElement {
  return (
    <NumberFieldPrimitive.Group
      data-density={density}
      data-slot="number-field-group"
      className={(state) =>
        cn(
          "flex h-control min-w-0 items-stretch rounded-sm border border-input bg-secondary text-foreground transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring data-disabled:opacity-50 motion-reduce:transition-none",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function NumberFieldInput({
  density,
  className,
  ...props
}: NumberFieldPrimitive.Input.Props & IDensityProps): ReactElement {
  return (
    <NumberFieldPrimitive.Input
      data-density={density}
      data-slot="number-field-input"
      className={(state) =>
        cn(
          "min-w-0 flex-1 bg-transparent px-control-x text-center text-sm tabular-nums outline-none disabled:cursor-not-allowed",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function NumberFieldDecrement({
  density,
  className,
  children = <MinusIcon />,
  ...props
}: NumberFieldPrimitive.Decrement.Props & IDensityProps): ReactElement {
  return (
    <NumberFieldPrimitive.Decrement
      data-density={density}
      data-slot="number-field-decrement"
      className={(state) =>
        cn(
          "flex w-control shrink-0 items-center justify-center rounded-s-sm outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
    </NumberFieldPrimitive.Decrement>
  );
}

function NumberFieldIncrement({
  density,
  className,
  children = <PlusIcon />,
  ...props
}: NumberFieldPrimitive.Increment.Props & IDensityProps): ReactElement {
  return (
    <NumberFieldPrimitive.Increment
      data-density={density}
      data-slot="number-field-increment"
      className={(state) =>
        cn(
          "flex w-control shrink-0 items-center justify-center rounded-e-sm outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
    </NumberFieldPrimitive.Increment>
  );
}

function NumberFieldScrubArea({
  density,
  className,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props & IDensityProps): ReactElement {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-density={density}
      data-slot="number-field-scrub-area"
      className={(state) =>
        cn(
          "flex w-fit cursor-ew-resize items-center gap-control-gap text-sm font-medium",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function NumberFieldScrubAreaCursor({
  density,
  className,
  children = <MoveHorizontalIcon />,
  ...props
}: NumberFieldPrimitive.ScrubAreaCursor.Props & IDensityProps): ReactElement {
  const resolvedDensity = useDensity(density);
  return (
    <NumberFieldPrimitive.ScrubAreaCursor
      data-density={resolvedDensity}
      data-slot="number-field-scrub-area-cursor"
      className={(state) =>
        cn(
          "z-50 font-sans text-sm text-foreground [&_svg]:size-5",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children}
    </NumberFieldPrimitive.ScrubAreaCursor>
  );
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
};

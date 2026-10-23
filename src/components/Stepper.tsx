import type { ComponentProps, ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { CheckIcon } from "lucide-react";
import { cn } from "../utils/cn.js";

function Stepper({ density, className, ...props }: TabsPrimitive.Root.Props & IDensityProps): ReactElement {
  return (
    <TabsPrimitive.Root
      data-density={density}
      data-slot="stepper"
      className={(state) =>
        cn(
          "group/stepper flex min-w-0 flex-col gap-panel data-[orientation=vertical]:flex-row",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}
function StepperList({
  density,
  className,
  activateOnFocus = false,
  ...props
}: TabsPrimitive.List.Props & IDensityProps): ReactElement {
  return (
    <TabsPrimitive.List
      data-density={density}
      data-slot="stepper-list"
      activateOnFocus={activateOnFocus}
      className={(state) =>
        cn(
          "flex min-w-0 gap-panel group-data-[orientation=vertical]/stepper:flex-col",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}
function StepperTrigger({ density, className, ...props }: TabsPrimitive.Tab.Props & IDensityProps): ReactElement {
  return (
    <TabsPrimitive.Tab
      data-density={density}
      data-slot="stepper-trigger"
      className={(state) =>
        cn(
          "group/step flex min-h-control items-center gap-control-gap rounded-sm text-sm text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring data-active:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}
type StepperIndicatorProps = ComponentProps<"span"> & { completed?: boolean };
function StepperIndicator({ completed = false, children, className, ...props }: StepperIndicatorProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      data-slot="stepper-indicator"
      data-completed={completed || undefined}
      className={cn(
        "flex size-control shrink-0 items-center justify-center rounded-sm border border-input bg-secondary text-sm tabular-nums group-data-active/step:border-primary group-data-active/step:bg-primary group-data-active/step:text-primary-foreground data-completed:border-primary data-completed:text-primary [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {completed ? <CheckIcon /> : children}
    </span>
  );
}
function StepperContent({ density, className, ...props }: TabsPrimitive.Panel.Props & IDensityProps): ReactElement {
  return (
    <TabsPrimitive.Panel
      data-density={density}
      data-slot="stepper-content"
      className={(state) =>
        cn(
          "min-w-0 flex-1 outline-none focus-visible:ring-1 focus-visible:ring-ring",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}
export { Stepper, StepperList, StepperTrigger, StepperIndicator, StepperContent };

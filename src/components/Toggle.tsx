import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-control-gap rounded-sm border border-transparent text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive aria-pressed:border-primary aria-pressed:bg-primary/15 aria-pressed:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-input bg-transparent hover:bg-muted",
      },
      size: {
        default:
          "h-control min-w-control px-control-x has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        sm: "h-control-sm min-w-control-sm px-control-x has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-control-lg min-w-control-lg px-control-x has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ToggleProps = IAnalyticsProps & TogglePrimitive.Props & VariantProps<typeof toggleVariants> & IDensityProps;

function Toggle({
  analytics,
  density,
  className,
  variant = "default",
  size = "default",
  ...props
}: ToggleProps): ReactElement {
  const trackedOnPressedChange = useAnalyticsCallback(
    "Toggle",
    analytics,
    { name: "ui.change-request" },
    props.onPressedChange,
  );

  return (
    <TogglePrimitive
      data-density={density}
      data-slot="toggle"
      className={(state) =>
        cn(toggleVariants({ variant, size }), typeof className === "function" ? className(state) : className)
      }
      {...props}
      onPressedChange={trackedOnPressedChange}
    />
  );
}

export { Toggle, toggleVariants };

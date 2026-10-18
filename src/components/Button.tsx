import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center rounded-sm border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:border-dashed disabled:border-border disabled:bg-transparent disabled:text-faint-foreground disabled:font-normal aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: { start: "justify-start", center: "justify-center", end: "justify-end" },
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-input bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground ",
        destructive:
          "border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:border-destructive/40 focus-visible:ring-destructive",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-control gap-control-gap px-control-x has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        xs: "h-control-xs gap-1 rounded-sm px-2 text-xs in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-control-sm gap-1 rounded-sm px-control-x text-sm in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-control-lg gap-control-gap px-control-x has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        icon: "size-control",
        "icon-xs":
          "size-control-xs rounded-sm in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-control-sm rounded-sm in-data-[slot=button-group]:rounded-sm",
        "icon-lg": "size-control-lg",
      },
    },
    defaultVariants: {
      align: "center",
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & IDensityProps;

function Button({
  density,
  className,
  variant = "default",
  size = "default",
  align = "center",
  ...props
}: ButtonProps): ReactElement {
  return (
    <ButtonPrimitive
      data-density={density}
      data-slot="button"
      className={(state) =>
        cn(buttonVariants({ variant, size, align }), typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

export { Button, buttonVariants };

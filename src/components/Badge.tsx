import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const badgeVariants = cva(
  "group/badge inline-flex h-tag w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-tag-x py-0 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground ",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & IDensityProps;

function Badge({ density, className, variant = "default", render, ...props }: BadgeProps): ReactElement | null {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      density,
    },
  });
}

export { Badge, badgeVariants };

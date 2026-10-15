import type { ComponentProps, ReactElement } from "react";
import type { Density, IDensityProps } from "../density/types";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-control-gap text-start text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground [&:is(a,button)]:outline-none [&:is(a,button)]:focus-visible:outline-1 [&:is(a,button)]:focus-visible:outline-ring",
  {
    variants: {
      variant: {
        default: "",
        separator:
          "before:me-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ms-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
        border: "border-b border-border pb-control-gap",
      },
    },
  },
);

type MarkerState = { slot: "marker"; variant: VariantProps<typeof markerVariants>["variant"]; density?: Density };
type MarkerProps = useRender.ComponentProps<"div", MarkerState> & VariantProps<typeof markerVariants> & IDensityProps;

function Marker({ density, className, variant = "default", render, ...props }: MarkerProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">({ className: cn(markerVariants({ variant, className })) }, props),
    render,
    state: { slot: "marker", variant, density },
  });
}

type MarkerIconProps = ComponentProps<"span"> & IDensityProps;

function MarkerIcon({ density, className, ...props }: MarkerIconProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="marker-icon"
      aria-hidden="true"
      className={cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  );
}

type MarkerContentProps = ComponentProps<"span"> & IDensityProps;

function MarkerContent({ density, className, ...props }: MarkerContentProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="marker-content"
      className={cn(
        "min-w-0 wrap-break-word group-data-[variant=separator]/marker:text-center [&>a]:underline [&>a]:underline-offset-3 [&>a:hover]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Marker, MarkerIcon, MarkerContent, markerVariants };

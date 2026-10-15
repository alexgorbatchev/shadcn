import type { ComponentProps, ReactElement } from "react";
import type { Density, IDensityProps } from "../density/types.js";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

type BubbleGroupProps = ComponentProps<"div"> & IDensityProps;

function BubbleGroup({ density, className, ...props }: BubbleGroupProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-control-gap", className)}
      {...props}
    />
  );
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        muted:
          "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
        tinted:
          "*:data-[slot=bubble-content]:bg-primary/10 *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/20",
        outline:
          "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground",
        ghost:
          "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type BubbleProps = ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> &
  IDensityProps & { align?: "start" | "end" };

function Bubble({ density, variant = "default", align = "start", className, ...props }: BubbleProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant }), className)}
      {...props}
    />
  );
}

type BubbleContentState = { slot: "bubble-content"; density?: Density };
type BubbleContentProps = useRender.ComponentProps<"div", BubbleContentState> & IDensityProps;

function BubbleContent({ density, className, render, ...props }: BubbleContentProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "w-fit max-w-full min-w-0 overflow-hidden rounded-sm border border-transparent px-control-x py-control-gap text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [&:is(button)]:text-start [&:is(button,a)]:transition-colors motion-reduce:transition-none [&:is(button,a)]:outline-none [&:is(button,a)]:focus-visible:border-ring [&:is(button,a)]:focus-visible:ring-1 [&:is(button,a)]:focus-visible:ring-ring",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "bubble-content", density },
  });
}

const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-sm border border-border bg-muted px-1.5 py-0.5 text-sm ring-2 ring-card has-[button]:p-0",
  {
    variants: {
      side: { top: "top-0 -translate-y-3/4", bottom: "bottom-0 translate-y-3/4" },
      align: { start: "start-3", end: "end-3" },
    },
    defaultVariants: { side: "bottom", align: "end" },
  },
);

type BubbleReactionsProps = ComponentProps<"div"> &
  IDensityProps & { align?: "start" | "end"; side?: "top" | "bottom" };

function BubbleReactions({
  density,
  side = "bottom",
  align = "end",
  className,
  ...props
}: BubbleReactionsProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  );
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions };

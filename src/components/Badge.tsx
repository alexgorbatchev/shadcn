import type { Density, IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

const badgeVariants = cva(
  "group/badge inline-flex w-fit items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-tag-x text-xs font-medium transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground focus-visible:ring-destructive [a]:hover:bg-destructive/80",
        // A status tag, not an action: a pill with a quiet divider edge and regular-weight muted text, so it never matches
        // the 4px corners, 3:1 edge and medium-weight label of an outline Button beside it.
        outline:
          "rounded-full border-border font-normal text-muted-foreground [a]:hover:bg-muted [a]:hover:text-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground ",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      wrap: {
        false: "h-tag shrink-0 py-0 whitespace-nowrap",
        true: "h-auto min-h-tag max-w-full shrink flex-wrap justify-start py-1 text-start leading-snug whitespace-normal break-words",
      },
      tone: {
        default: "",
        warning: "",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        wrap: true,
        className: "rounded-[10px] px-2.5",
      },
      {
        variant: "outline",
        tone: "warning",
        className: "border-warning/50 bg-warning/8 text-warning [a]:hover:bg-warning/15 [a]:hover:text-warning",
      },
      {
        variant: "warning",
        wrap: true,
        className: "px-2",
      },
    ],
    defaultVariants: {
      variant: "default",
      wrap: false,
      tone: "default",
    },
  },
);

type BadgeState = {
  slot: "badge";
  variant: VariantProps<typeof badgeVariants>["variant"];
  wrap: boolean;
  tone?: "warning";
  density?: Density;
};
type BadgeProps = useRender.ComponentProps<"span", BadgeState> &
  Omit<VariantProps<typeof badgeVariants>, "wrap" | "tone"> &
  IDensityProps & {
    /** Allow long labels to wrap onto multiple lines within the available width. */
    wrap?: boolean;
    /** Semantic accent tone for subtle status tags such as `variant="outline"`. */
    tone?: "default" | "warning";
  };

function Badge({
  density,
  className,
  variant = "default",
  wrap = false,
  tone = "default",
  render,
  ...props
}: BadgeProps): ReactElement {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, wrap, tone }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      wrap,
      tone: tone === "default" ? undefined : tone,
      density,
    },
  });
}

export { Badge, badgeVariants };

import type { ComponentProps, ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";

const quoteVariants = cva("block min-w-0 border-s-2 border-border break-words text-muted-foreground", {
  variants: {
    size: {
      /** Quoted text beside a composer or in a panel. */
      default: "ps-3 text-sm",
      /** Quoted text in a message footer, bubble or list row. */
      compact: "ps-2 text-xs",
    },
    clamp: {
      /** Long quotes stop after two lines. */
      true: "line-clamp-2",
      false: "",
    },
  },
  defaultVariants: { size: "default", clamp: false },
});

type QuoteProps = ComponentProps<"blockquote"> & VariantProps<typeof quoteVariants> & IDensityProps;

/**
 * Text quoted from elsewhere, such as the passage a comment targets or the message a reply answers. A logical
 * start rule marks it as a quote in both reading directions; `compact` fits message footers and bubbles, and `clamp`
 * stops a long quote after two lines.
 */
function Quote({ size, clamp, density, className, ...props }: QuoteProps): ReactElement {
  return (
    <blockquote
      data-density={density}
      data-slot="quote"
      data-size={size ?? "default"}
      className={cn(quoteVariants({ size, clamp }), className)}
      {...props}
    />
  );
}

export { Quote, quoteVariants };
export type { QuoteProps };

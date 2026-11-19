import type { ComponentProps, ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn.js";

const imageRegionMarkerVariants = cva(
  // The outline sits 1px outside the region over a 4px halo in the page background, so the colour beside it on both
  // sides is always the page's own surface and it keeps its contrast over any screenshot. Forced colours drop the
  // halo, so the outline switches to the system Highlight colour there.
  "pointer-events-none absolute rounded-xs shadow-[0_0_0_4px_var(--background)] ring-1 ring-background outline-2 outline-offset-1 forced-colors:outline-[Highlight]",
  {
    variants: {
      variant: {
        /** A saved comment's region. */
        comment: "bg-primary/10 outline-primary",
        /** A region being drawn or placed, before it has a comment. */
        draft: "bg-primary/10 outline-dashed outline-primary",
        /** A changed region found by comparing two images. */
        difference: "bg-warning/10 outline-warning",
      },
    },
    defaultVariants: { variant: "comment" },
  },
);

export type ImageRegionMarkerVariant = NonNullable<VariantProps<typeof imageRegionMarkerVariants>["variant"]>;

export interface IImageRegionMarkerProps extends ComponentProps<"div"> {
  /** Which kind of region the marker outlines. Defaults to `comment`. */
  variant?: ImageRegionMarkerVariant;
}

/**
 * Outlines a region drawn over an image. Position it with `style` (`left`, `top`, `width`, `height`, in pixels or
 * percentages of the positioned image box). Children render inside the marker's box, such as an
 * `ImageRegionMarkerBadge` pinned to one of its corners.
 */
export function ImageRegionMarker({ variant, className, ...props }: IImageRegionMarkerProps): ReactElement {
  return (
    <div
      data-slot="image-region-marker"
      data-variant={variant ?? "comment"}
      className={cn(imageRegionMarkerVariants({ variant }), className)}
      {...props}
    />
  );
}

export type IImageRegionMarkerBadgeProps = ComponentProps<"div">;

/**
 * Holds an interactive control, such as a comment-count button, beside an `ImageRegionMarker`. It carries the
 * marker's outline and halo, so its edge stays visible on light and dark screenshots. Position it with `style`
 * relative to the marker's box; it receives pointer events although the marker does not.
 */
export function ImageRegionMarkerBadge({ className, ...props }: IImageRegionMarkerBadgeProps): ReactElement {
  return (
    <div
      data-slot="image-region-marker-badge"
      className={cn(
        "pointer-events-auto absolute z-10 rounded-sm shadow-[0_0_0_4px_var(--background)] outline-2 outline-primary forced-colors:outline-[Highlight]",
        className,
      )}
      {...props}
    />
  );
}

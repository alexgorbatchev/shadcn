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

/** A length in CSS pixels, or any CSS length such as a percentage of the positioned image box. */
export type ImageRegionLength = number | string;

/** Where a region sits inside its positioned image box. */
export interface IImageRegionBox {
  left: ImageRegionLength;
  top: ImageRegionLength;
  width: ImageRegionLength;
  height: ImageRegionLength;
}

/** Where a badge sits relative to its marker's box. */
export interface IImageRegionBadgePosition {
  left: ImageRegionLength;
  top: ImageRegionLength;
}

export interface IImageRegionMarkerProps extends ComponentProps<"div"> {
  /** Which kind of region the marker outlines. Defaults to `comment`. */
  variant?: ImageRegionMarkerVariant;
  /** Emphasizes the currently focused or stepped-to marker above its siblings. */
  active?: boolean;
  /** The region's box inside the positioned image box. Lets consumers place the marker without passing `style`. */
  region?: IImageRegionBox;
}

/**
 * Outlines a region drawn over an image. Position it with `region` (`left`, `top`, `width`, `height`, in pixels or
 * any CSS length, such as percentages of the positioned image box). Children render inside the marker's box, such as
 * an `ImageRegionMarkerBadge` pinned to one of its corners.
 */
export function ImageRegionMarker({
  variant,
  active = false,
  region,
  className,
  style,
  ...props
}: IImageRegionMarkerProps): ReactElement {
  return (
    <div
      data-slot="image-region-marker"
      data-variant={variant ?? "comment"}
      data-active={active ? "" : undefined}
      className={cn(
        imageRegionMarkerVariants({ variant }),
        active && "z-10 outline-[3px]",
        active && variant === "difference" && "bg-warning/20",
        className,
      )}
      style={region ? { ...style, ...region } : style}
      {...props}
    />
  );
}

export interface IImageRegionMarkerBadgeProps extends ComponentProps<"div"> {
  /** Where the badge sits relative to its marker's box. */
  position?: IImageRegionBadgePosition;
  /**
   * Whether the badge takes pointer input. Defaults to `true`; pass `false` while another gesture, such as drawing a
   * new region, owns the pointer so the badge does not intercept it.
   */
  interactive?: boolean;
}

/**
 * Holds an interactive control, such as a comment-count button, beside an `ImageRegionMarker`. It carries the
 * marker's outline and halo, so its edge stays visible on light and dark screenshots. Position it with `position`
 * relative to the marker's box; it receives pointer events although the marker does not, unless `interactive` is
 * `false`.
 */
export function ImageRegionMarkerBadge({
  position,
  interactive = true,
  className,
  style,
  ...props
}: IImageRegionMarkerBadgeProps): ReactElement {
  return (
    <div
      data-slot="image-region-marker-badge"
      data-interactive={interactive}
      className={cn(
        "absolute z-10 rounded-sm shadow-[0_0_0_4px_var(--background)] outline-2 outline-primary forced-colors:outline-[Highlight]",
        interactive ? "pointer-events-auto" : "pointer-events-none",
        className,
      )}
      style={position ? { ...style, ...position } : style}
      {...props}
    />
  );
}

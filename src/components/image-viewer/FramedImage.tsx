import type { ComponentProps, ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn.js";

const framedImageVariants = cva(
  // A 1px edge in the media-edge token keeps at least 3:1 against the page in both themes, so a white screenshot in
  // the light theme and a black one in the dark theme still show where they end.
  "rounded-xs border border-media-edge",
  {
    variants: {
      size: {
        /** Natural size, scaled down to the column width and to at most 70% of the viewport height, never cropped. */
        intrinsic: "h-auto max-h-[70vh] w-auto max-w-full",
        /** Fills its container's width, as in a grid of thumbnails. */
        fill: "block h-auto w-full",
      },
    },
    defaultVariants: { size: "intrinsic" },
  },
);

export type FramedImageSize = NonNullable<VariantProps<typeof framedImageVariants>["size"]>;

export interface IFramedImageProps extends ComponentProps<"img"> {
  /** `intrinsic` (the default) keeps the image's own size within the column and 70% of the viewport height. */
  size?: FramedImageSize;
}

/**
 * An agent-supplied or user-supplied image framed as evidence: a visible edge in both themes and a height cap so a
 * tall capture never pushes the rest of the page a screen down.
 */
export function FramedImage({ size, className, alt = "", ...props }: IFramedImageProps): ReactElement {
  return (
    <img
      data-slot="framed-image"
      data-size={size ?? "intrinsic"}
      alt={alt}
      className={cn(framedImageVariants({ size }), className)}
      {...props}
    />
  );
}

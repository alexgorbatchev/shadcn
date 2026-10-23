import { ReactCrop, type ReactCropProps } from "react-image-crop";
import type { ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";

type ImageCropProps = ReactCropProps & IDensityProps;
/** Import react-image-crop/dist/ReactCrop.css alongside the package theme. */
function ImageCrop({ className, density, ...props }: ImageCropProps): ReactElement {
  return (
    <div data-density={density} data-scroll="none" className="max-w-full rounded-sm border border-border bg-card p-2">
      <ReactCrop
        {...props}
        className={cn(
          "max-w-full [&_.ReactCrop__drag-handle]:border-foreground [&_.ReactCrop__drag-handle]:bg-background",
          className,
        )}
      />
    </div>
  );
}
export { ImageCrop };
export type { ImageCropProps };
export {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
  convertToPercentCrop,
  cropToCanvas,
  cropToImg,
} from "react-image-crop";
export type { Crop, PixelCrop, PercentCrop } from "react-image-crop";

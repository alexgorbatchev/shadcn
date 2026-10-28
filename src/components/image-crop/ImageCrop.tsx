import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalytics } from "../../hooks/useAnalytics.js";
import { useAnalyticsEnabled } from "../../hooks/useAnalyticsEnabled.js";
import { ReactCrop, type ReactCropProps } from "react-image-crop";
import { useLayoutEffect, useRef, type ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";

type ImageCropProps = IAnalyticsProps & ReactCropProps & IDensityProps;
/** Import react-image-crop/dist/ReactCrop.css alongside the package theme. */
function ImageCrop({ analytics, className, density, ...props }: ImageCropProps): ReactElement {
  const enabled = useAnalyticsEnabled(analytics);
  const dirty = useRef(false);
  const track = useAnalytics("ImageCrop", analytics);
  useLayoutEffect(() => {
    dirty.current = false;
  }, [enabled]);
  const onChange: ReactCropProps["onChange"] = (...args) => {
    props.onChange(...args);
    dirty.current = enabled;
  };
  const onComplete: NonNullable<ReactCropProps["onComplete"]> = (...args) => {
    props.onComplete?.(...args);
    const changed = dirty.current;
    dirty.current = false;
    if (changed) track({ name: "ui.commit" });
  };
  return (
    <div data-density={density} data-scroll="none" className="max-w-full rounded-sm border border-border bg-card p-2">
      <ReactCrop
        {...props}
        onChange={onChange}
        onComplete={onComplete}
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

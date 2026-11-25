import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog.js";

export interface IMediaShellProps extends IDensityProps {
  open: boolean;
  /** Receives Base UI's change details, so Escape can close an inner layer first by calling `details.cancel()`. */
  onOpenChange: ComponentProps<typeof Dialog>["onOpenChange"];
  /** The shown item's name, such as an image's alt text or an option's label. Truncates to one line. */
  title: ReactNode;
  /** A one-line hint or status under the title, such as the keys the stage takes. */
  description?: ReactNode;
  /** The stage: an `ImageViewer`, `ImageGallery` or `ImageComparison`, optionally inside a side panel layout. */
  children: ReactNode;
}

/**
 * The full-screen shell every image, comparison, gallery and diagram opens in: a header with the shown item's name, a
 * hint line and an always visible Close, then a stage that fills the rest of the screen. Escape and Close close it.
 */
export function MediaShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  density,
}: IMediaShellProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="fullscreen"
        density={density}
        data-slot="media-shell"
        className="[@media(max-height:280px)]:gap-1.5 [@media(max-height:280px)]:p-2"
      >
        <DialogHeader className="[@media(max-height:280px)]:min-h-control-sm [@media(max-height:280px)]:justify-center [@media(max-height:280px)]:pe-8">
          <DialogTitle className="truncate">{title}</DialogTitle>
          {description !== undefined && (
            <DialogDescription className="[@media(max-height:280px)]:sr-only">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div data-slot="media-shell-stage" data-scroll="none" className="flex min-h-0 min-w-0 flex-1 flex-col">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

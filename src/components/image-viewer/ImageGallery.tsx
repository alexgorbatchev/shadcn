import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState, type KeyboardEvent, type ReactElement, type ReactNode, type Ref } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Button } from "../Button.js";
import { ImageViewer } from "./ImageViewer.js";

export interface IImageGalleryItem {
  /** Stable identity of the item, such as an option value. */
  key: string;
  src: string;
  alt: string;
  /** The item's name, used in the step announcement: "Bold · 2 of 3". */
  label: string;
}

export interface IImageGalleryProps extends IDensityProps {
  items: readonly IImageGalleryItem[];
  /** The shown item's position in `items`. */
  index: number;
  onIndexChange: (index: number) => void;
  /** Width in CSS pixels the first shown image had where it was opened from; see `ImageViewer`. */
  openingWidth?: number;
  /** Accessible name of the stage, followed by the zoom percent. Defaults to the shown item's label. */
  label?: string;
  /** Accessible name of the step back button. Defaults to "Previous image". */
  previousLabel?: string;
  /** Accessible name of the step forward button. Defaults to "Next image". */
  nextLabel?: string;
  /** Further controls in the toolbar row after the stepper, such as a Choose action. */
  toolbar?: ReactNode;
  /** Content positioned over the shown image; see `ImageViewer`. */
  overlay?: ReactNode;
  imageRef?: Ref<HTMLImageElement>;
  stageRef?: Ref<HTMLDivElement>;
  /** Runs for keys on the focused stage before the gallery's own; call `preventDefault()` to replace one. */
  onStageKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Further `aria-keyshortcuts` of the stage, such as "R". */
  stageKeyShortcuts?: string;
}

/** Whether the viewer around the focused stage shows the whole image, where Left and Right cannot mean panning. */
function isFitted(stage: HTMLElement): boolean {
  return stage.closest("[data-slot=image-viewer]")?.getAttribute("data-zoom") === "fit";
}

/**
 * Steps through a set of images in one `ImageViewer`, keeping its zoom and viewed position, so the same area of each
 * image can be compared. The toolbar holds the zoom bar, Previous, "2 of 3" and Next, then `toolbar`; Left and Right
 * step on the focused stage only at Fit, where arrows do not pan. Each step is announced politely with the item's
 * label and position. Compose it inside `MediaShell` and name the shell after the shown item.
 */
export function ImageGallery({
  items,
  index,
  onIndexChange,
  openingWidth,
  label,
  previousLabel = "Previous image",
  nextLabel = "Next image",
  toolbar,
  overlay,
  imageRef,
  stageRef,
  onStageKeyDown,
  stageKeyShortcuts,
  density,
}: IImageGalleryProps): ReactElement {
  const [announcement, setAnnouncement] = useState("");
  const item = items[index];
  const count = items.length;

  function step(next: number): void {
    const target = items[next];
    if (!target) return;
    setAnnouncement(`${target.label} · ${next + 1} of ${count}`);
    onIndexChange(next);
  }

  function handleStageKey(event: KeyboardEvent<HTMLDivElement>): void {
    onStageKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (!isFitted(event.currentTarget)) return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? index - 1 : index + 1);
  }

  if (!item) return <div data-slot="image-gallery" data-density={density} />;
  return (
    <div
      data-slot="image-gallery"
      data-scroll="none"
      data-density={density}
      className="flex size-full min-h-0 min-w-0 flex-1 flex-col"
    >
      <ImageViewer
        src={item.src}
        alt={item.alt}
        label={label ?? item.label}
        openingWidth={openingWidth}
        showZoomControl
        imageRef={imageRef}
        stageRef={stageRef}
        overlay={overlay}
        onStageKeyDown={handleStageKey}
        stageKeyShortcuts={stageKeyShortcuts}
        density={density}
        toolbar={
          <>
            <div
              role="group"
              aria-label="Images"
              data-slot="image-gallery-stepper"
              className="flex items-center gap-control-gap"
            >
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={previousLabel}
                disabledReason={index === 0 ? "This is the first image" : undefined}
                onClick={() => step(index - 1)}
              >
                <ChevronLeftIcon />
              </Button>
              <span data-slot="image-gallery-position" className="text-xs text-muted-foreground tabular-nums">
                {index + 1} of {count}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={nextLabel}
                disabledReason={index === count - 1 ? "This is the last image" : undefined}
                onClick={() => step(index + 1)}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            {toolbar}
          </>
        }
      />
      <p role="status" data-slot="image-gallery-status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

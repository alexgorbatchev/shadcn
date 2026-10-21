import { Button } from "../../Button.js";
import type { JSX } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, ImageOffIcon } from "lucide-react";
import { useCallback, useRef, useState, type ComponentProps } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../Dialog.js";
import { cn } from "../../../utils/cn.js";
import { safeHref } from "../utils/href.js";
import { clamp } from "../utils/range.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
export interface IGalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string | undefined;
  source?: IGalleryImageSource;
}
interface IGalleryImageSource {
  label?: string;
  url?: string;
}
export interface IImageGalleryProps extends Omit<Omit<ComponentProps<"div">, "children">, "className" | "style"> {
  images: readonly IGalleryImage[];
  maxVisible?: number | undefined;
  onOpen?: ((id: string) => void) | undefined;
}
const keyForImage = (image: IGalleryImage) => `${image.id}\u0000${image.src}`;
export function ImageGallery({ images, maxVisible = 6, onOpen, ...props }: IImageGalleryProps): JSX.Element | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<ReadonlySet<string>>(() => new Set());
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const previousRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const index = images.findIndex((image) => image.id === activeId);
  if (activeId !== null && index === -1) setActiveId(null);
  const activeImage = index === -1 ? undefined : images[index];
  const sourceHref = safeHref(activeImage?.source?.url);
  const visibleCount = Math.floor(clamp(maxVisible, 1, images.length));
  const visibleImages = images.slice(0, visibleCount);
  const close = useCallback(() => {
    setActiveId(null);
  }, []);
  const focusDialog = useCallback((node: HTMLDivElement | null) => {
    node?.closest<HTMLElement>('[role="dialog"]')?.focus();
  }, []);
  const show = useCallback(
    (nextIndex: number) => {
      const image = images[nextIndex];
      if (!image) return;
      if (nextIndex === 0 && previousRef.current?.matches(":focus")) {
        nextRef.current?.focus();
      } else if (nextIndex === images.length - 1 && nextRef.current?.matches(":focus")) {
        previousRef.current?.focus();
      }
      setActiveId(image.id);
    },
    [images],
  );
  const open = (nextIndex: number, trigger: HTMLButtonElement) => {
    const image = images[nextIndex];
    if (!image) return;
    triggerRef.current = trigger;
    setActiveId(image.id);
    onOpen?.(image.id);
  };
  const markFailed = (image: IGalleryImage) => {
    const key = keyForImage(image);
    setFailedImages((current) => (current.has(key) ? current : new Set(current).add(key)));
  };
  if (images.length === 0) return null;
  return (
    <div data-testid="ImageGallery" data-slot="image-gallery" className={cn("@container w-full max-w-md")} {...props}>
      <div className="grid grid-cols-2 gap-2 @sm:grid-cols-3">
        {visibleImages.map((image, imageIndex) => {
          const failed = failedImages.has(keyForImage(image));
          const overflow = imageIndex === visibleCount - 1 && images.length > visibleCount;
          return (
            <button
              key={image.id}
              type="button"
              aria-label={`Open image: ${image.alt}`}
              onClick={(event) => open(imageIndex, event.currentTarget)}
              className={cn(
                field,
                "focus-visible:ring-foreground/30 relative aspect-square overflow-hidden rounded-md transition-colors duration-150 outline-none focus-visible:ring-1 motion-reduce:transition-none",
              )}
            >
              {failed ? (
                <span className="text-muted-foreground flex size-full items-center justify-center">
                  <ImageOffIcon aria-hidden="true" className={cn("size-4")} />
                  <span className="sr-only">Image unavailable</span>
                </span>
              ) : (
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="size-full object-cover"
                  onError={() => markFailed(image)}
                />
              )}
              {overflow ? (
                <span className="bg-foreground/65 text-background absolute inset-0 flex items-center justify-center text-base font-medium">
                  +{images.length - visibleCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {activeImage ? (
        <Dialog
          open
          onOpenChange={(nextOpen: boolean) => {
            if (!nextOpen) close();
          }}
        >
          <DialogContent
            size="wide"
            aria-describedby={undefined}
            finalFocus={triggerRef}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" && index > 0) {
                event.preventDefault();
                show(index - 1);
              } else if (event.key === "ArrowRight" && index < images.length - 1) {
                event.preventDefault();
                show(index + 1);
              }
            }}
          >
            <DialogTitle className="sr-only">
              Image {index + 1} of {images.length}
            </DialogTitle>
            <div ref={focusDialog} className="flex min-h-0 items-center justify-center px-10">
              {failedImages.has(keyForImage(activeImage)) ? (
                <div className="text-muted-foreground flex h-[min(75vh,512px)] w-full items-center justify-center">
                  <ImageOffIcon aria-hidden="true" className={cn("size-4")} />
                  <span className="sr-only">Image unavailable</span>
                </div>
              ) : (
                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  className="max-h-[75vh] max-w-full object-contain"
                  onError={() => markFailed(activeImage)}
                />
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Button
                ref={previousRef}
                type="button"
                aria-label="Previous image"
                disabled={index === 0}
                onClick={() => show(index - 1)}
                variant="ghost"
                size="icon"
              >
                <ChevronLeftIcon aria-hidden="true" data-icon="inline-start" />
              </Button>
              <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                {activeImage.caption ? <p className="text-foreground/75 truncate">{activeImage.caption}</p> : null}
                {activeImage.source?.label ? (
                  sourceHref ? (
                    <a
                      href={sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground/80 flex min-w-0 items-center gap-1 truncate transition-colors"
                    >
                      <span className="truncate">{activeImage.source.label}</span>
                      <ExternalLinkIcon aria-hidden="true" className={cn("size-3.5")} />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground truncate">{activeImage.source.label}</span>
                  )
                ) : null}
              </div>
              <span className={cn(mono, "text-muted-foreground shrink-0")}>
                {index + 1} / {images.length}
              </span>
              <Button
                ref={nextRef}
                type="button"
                aria-label="Next image"
                disabled={index === images.length - 1}
                onClick={() => show(index + 1)}
                variant="ghost"
                size="icon"
              >
                <ChevronRightIcon aria-hidden="true" data-icon="inline-start" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

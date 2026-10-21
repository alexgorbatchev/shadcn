import { useState, useEffect, useRef, type ComponentProps, type JSX, type PropsWithChildren } from "react";
import { Button } from "../../Button.js";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../../Dialog.js";
import { copyImagePart, downloadImagePart } from "../utils/imageUtils.js";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CopyIcon,
  DownloadIcon,
  ImageIcon,
  ImageOffIcon,
  Loader2Icon,
  RefreshCwIcon,
  ShieldAlertIcon,
} from "lucide-react";
import type { ImageMessagePart, ImageMessagePartComponent } from "@assistant-ui/react";
import { cn } from "../../../utils/cn.js";
import { hostOf, safeHref } from "../utils/href.js";
const imageVariants = cva("relative overflow-hidden rounded-md", {
  variants: {
    variant: {
      outline: "border-frame-edge border bg-card",
      ghost: "",
      muted: "bg-secondary",
    },
    size: {
      sm: "max-w-64",
      default: "max-w-96",
      lg: "max-w-xl",
      full: "w-full",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "default",
  },
});
export type ImageRootProps = Omit<ComponentProps<"div">, "className" | "style"> & VariantProps<typeof imageVariants>;
export function ImageRoot({ variant, size, children, ...props }: ImageRootProps): JSX.Element {
  return (
    <div
      data-testid="ImageRoot"
      data-slot="image-root"
      data-variant={variant}
      data-size={size}
      className={cn(imageVariants({ variant, size }))}
      {...props}
    >
      {children}
    </div>
  );
}
interface IImagePreviewProps extends Omit<ComponentProps<"img">, "children" | "className" | "style"> {
  ratio?: "auto" | "1:1" | "4:3" | "16:9" | "9:16" | undefined;
  fit?: "cover" | "contain" | undefined;
}
export function ImagePreview({
  ratio = "auto",
  fit = "contain",
  onLoad,
  onError,
  alt = "Image content",
  src,
  ...props
}: IImagePreviewProps): JSX.Element {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);
  const [errorSrc, setErrorSrc] = useState<string | undefined>(undefined);
  const loaded = loadedSrc === src;
  const error = errorSrc === src;
  const fixedRatio = ratio !== "auto";
  const ratioClassName =
    ratio === "1:1"
      ? "aspect-square"
      : ratio === "4:3"
        ? "aspect-[4/3]"
        : ratio === "16:9"
          ? "aspect-video"
          : ratio === "9:16"
            ? "aspect-[9/16]"
            : undefined;
  useEffect(() => {
    const image = imgRef.current;
    if (typeof src !== "string" || !image?.complete) return;
    if (image.naturalWidth > 0) setLoadedSrc(src);
    else setErrorSrc(src);
  }, [src]);
  return (
    <div
      data-testid="ImagePreview"
      data-slot="image-preview"
      className={cn("relative", fixedRatio ? ratioClassName : "min-h-32")}
    >
      {!loaded && !error && (
        <div
          data-slot="image-preview-loading"
          className="bg-secondary absolute inset-0 flex items-center justify-center"
        >
          <ImageIcon aria-hidden="true" className={cn("size-4")} />
          <span className="sr-only">Loading image</span>
        </div>
      )}
      {error ? (
        <div
          data-slot="image-preview-error"
          className={cn("bg-secondary flex min-h-32 items-center justify-center p-4", fixedRatio && "absolute inset-0")}
        >
          <ImageOffIcon aria-hidden="true" className={cn("size-4")} />
          <span className="sr-only">Image could not load</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            fixedRatio
              ? cn("block h-full w-full", {
                  "object-cover": fit === "cover",
                  "object-contain": fit === "contain",
                })
              : "block h-auto w-full object-contain",
            !loaded && "invisible",
          )}
          onLoad={(e) => {
            if (typeof src === "string") setLoadedSrc(src);
            onLoad?.(e);
          }}
          onError={(e) => {
            if (typeof src === "string") setErrorSrc(src);
            onError?.(e);
          }}
          {...props}
        />
      )}
    </div>
  );
}
export interface IImageSourceProps extends Omit<ComponentProps<"div">, "className" | "style"> {
  label?: string | undefined;
  url?: string | undefined;
  iconUrl?: string | undefined;
}
export function ImageSource({ label, url, iconUrl, ...props }: IImageSourceProps): JSX.Element | null {
  const href = safeHref(url);
  const host = hostOf(url);
  const displayLabel = label || host;
  const [failedIconUrl, setFailedIconUrl] = useState<string | undefined>();
  if (!displayLabel) return null;
  const showIcon = iconUrl !== undefined && failedIconUrl !== iconUrl;
  return (
    <div
      data-testid="ImageSource"
      data-slot="image-source"
      className={cn("text-muted-foreground flex items-center gap-2 border-t px-2 py-1.5 text-sm")}
      {...props}
    >
      {showIcon ? (
        <img
          data-slot="image-source-icon"
          src={iconUrl}
          alt=""
          className="size-4 shrink-0 rounded-sm"
          onError={() => setFailedIconUrl(iconUrl)}
        />
      ) : (
        <span
          data-slot="image-source-icon-fallback"
          aria-hidden="true"
          className="bg-secondary flex size-4 shrink-0 items-center justify-center rounded-sm text-sm font-medium"
        >
          {displayLabel.charAt(0).toUpperCase()}
        </span>
      )}
      {href ? (
        <a
          data-slot="image-source-label"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground truncate"
        >
          {displayLabel}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <span data-slot="image-source-label" className="truncate">
          {displayLabel}
        </span>
      )}
    </div>
  );
}
export function ImageFilename({ children, ...props }: ImageFilenameProps): JSX.Element | null {
  if (!children) return null;
  return (
    <span
      data-testid="ImageFilename"
      data-slot="image-filename"
      className={cn("text-muted-foreground block truncate px-2 py-1.5 text-sm")}
      {...props}
    >
      {children}
    </span>
  );
}
interface IImageZoomOptions {
  src: string;
  alt?: string;
}
type ImageZoomProps = PropsWithChildren<IImageZoomOptions>;
type ImageFilenameProps = Omit<ComponentProps<"span">, "className" | "style">;
export function ImageZoom({ src, alt = "Image preview", children }: ImageZoomProps): JSX.Element {
  return (
    <figure data-testid="ImageZoom">
      <Dialog>
        <DialogTrigger
          render={
            <button
              data-testid="ImageZoom--trigger"
              type="button"
              className="block w-full cursor-zoom-in"
              aria-label="Zoom image"
            />
          }
        >
          {children}
        </DialogTrigger>
        <DialogContent size="wide" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Zoomed image</DialogTitle>
          <img
            data-testid="ImageZoom--content"
            src={src}
            alt={alt}
            className="max-h-[calc(100dvh-48px)] max-w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </figure>
  );
}
export function ImageGenerating(): JSX.Element {
  return (
    <div
      data-testid="ImageGenerating"
      data-slot="image-generating"
      className={cn("bg-secondary flex min-h-32 items-center justify-center p-4")}
    >
      <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
      <span className="sr-only">Generating image…</span>
    </div>
  );
}
export function ImageContentFilterError({ reason }: IImageContentFilterErrorProps): JSX.Element {
  return (
    <div
      data-testid="ImageContentFilterError"
      data-slot="image-content-filter-error"
      className={cn("bg-secondary flex min-h-32 flex-col items-center justify-center gap-2 p-4 text-center")}
    >
      <ShieldAlertIcon aria-hidden="true" className={cn("size-4")} />
      <p className="text-sm font-medium">Image could not be generated</p>
      {reason && <p className="text-muted-foreground text-sm">{reason}</p>}
    </div>
  );
}
export interface IImageActionsProps {
  part: ImageMessagePart;
  onRegenerate?: () => void | Promise<void>;
}
export function ImageRegenerateButton({ onRegenerate }: IRegenerateButtonProps): JSX.Element {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <Button
        type="button"
        onClick={async () => {
          setIsRegenerating(true);
          setError(null);
          try {
            await onRegenerate();
          } catch (error) {
            setError(`Could not regenerate image: ${error instanceof Error ? error.message : String(error)}`);
          } finally {
            setIsRegenerating(false);
          }
        }}
        disabled={isRegenerating}
        aria-busy={isRegenerating || undefined}
        data-testid="ImageRegenerateButton"
        data-slot="image-regenerate"
        aria-label="Regenerate image"
        variant="ghost"
      >
        <RefreshCwIcon
          aria-hidden="true"
          data-icon="inline-start"
          className={cn(isRegenerating && "animate-spin motion-reduce:animate-none")}
        />
      </Button>
      {error !== null ? (
        <p role="alert" className="basis-full text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </>
  );
}
type ImageActionFeedback =
  | { image: string; status: "copying" | "copied" }
  | { image: string; status: "error"; message: string };
export function ImageActions({ part, onRegenerate }: IImageActionsProps): JSX.Element {
  const [actionFeedback, setActionFeedback] = useState<ImageActionFeedback | null>(null);
  const requestRef = useRef(0);
  useEffect(
    () => () => {
      requestRef.current += 1;
    },
    [part.image],
  );
  const feedback = actionFeedback?.image === part.image ? actionFeedback : null;
  return (
    <div data-testid="ImageActions" data-slot="image-actions" className="flex flex-wrap items-center gap-1 p-1">
      <Button
        type="button"
        onClick={() => {
          requestRef.current += 1;
          setActionFeedback(null);
          try {
            downloadImagePart(part);
          } catch (error) {
            setActionFeedback({
              image: part.image,
              status: "error",
              message: `Could not download image: ${error instanceof Error ? error.message : String(error)}`,
            });
          }
        }}
        data-slot="image-download"
        aria-label="Download image"
        variant="ghost"
      >
        <DownloadIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        type="button"
        onClick={async () => {
          const request = ++requestRef.current;
          setActionFeedback({ image: part.image, status: "copying" });
          try {
            await copyImagePart(part);
            if (request === requestRef.current) setActionFeedback({ image: part.image, status: "copied" });
          } catch (error) {
            if (request === requestRef.current)
              setActionFeedback({
                image: part.image,
                status: "error",
                message: `Could not copy image: ${error instanceof Error ? error.message : String(error)}`,
              });
          }
        }}
        disabled={feedback?.status === "copying"}
        aria-busy={feedback?.status === "copying" || undefined}
        data-slot="image-copy"
        aria-label="Copy image"
        variant="ghost"
      >
        <CopyIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      {onRegenerate && <ImageRegenerateButton key={part.image} onRegenerate={onRegenerate} />}
      {feedback?.status === "error" ? (
        <p role="alert" className="basis-full text-sm text-destructive">
          {feedback.message}
        </p>
      ) : null}
      {feedback?.status === "copied" ? (
        <output className="basis-full text-sm text-muted-foreground">Image copied.</output>
      ) : null}
    </div>
  );
}
export function Image(props: ImagePartProps): JSX.Element {
  const { image, filename, status } = props;
  if (status?.type === "running") {
    return (
      <ImageRoot>
        <ImageGenerating />
        <ImageFilename>{filename}</ImageFilename>
      </ImageRoot>
    );
  }
  if (status?.type === "incomplete" && status.reason === "content-filter") {
    return (
      <ImageRoot>
        <ImageContentFilterError reason="The provider blocked this image." />
      </ImageRoot>
    );
  }
  return (
    <ImageRoot>
      <ImageZoom src={image} alt={filename || "Image content"}>
        <ImagePreview src={image} alt={filename || "Image content"} />
      </ImageZoom>
      <ImageFilename>{filename}</ImageFilename>
    </ImageRoot>
  );
}
interface IImageContentFilterErrorProps {
  reason?: string;
}
interface IRegenerateButtonProps {
  onRegenerate: () => void | Promise<void>;
}
type ImagePartProps = ComponentProps<ImageMessagePartComponent>;

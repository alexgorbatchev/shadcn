import { useRef, type ComponentProps, type JSX } from "react";
import { cn } from "../../../utils/cn.js";
import { field, mono } from "./constants.js";
import { useMediaDuration } from "../hooks/useMediaDuration.js";
import { formatMediaDuration } from "../utils/formatMediaDuration.js";
export interface IVideoPlayerProps extends Omit<Omit<ComponentProps<"div">, "children">, "className" | "style"> {
  src: string;
  poster?: string | undefined;
  title?: string | undefined;
  ratio?: "16:9" | "4:3" | "1:1" | "9:16" | "auto" | undefined;
  durationMs?: number | undefined;
}
export function VideoPlayer({
  src,
  poster,
  title,
  ratio = "16:9",
  durationMs,
  ...props
}: IVideoPlayerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { duration, setDurationFromMetadata } = useMediaDuration(videoRef, src, durationMs);
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
  return (
    <div
      data-testid="VideoPlayer"
      data-slot="video-player"
      className={cn("flex w-full max-w-xl flex-col gap-2")}
      {...props}
    >
      <div className={cn(field, "overflow-hidden rounded-md", ratioClassName)}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          aria-label={title ?? "Video"}
          className={cn("block max-w-full", ratio !== "auto" && "h-full w-full object-contain")}
          onLoadedMetadata={(event) => {
            setDurationFromMetadata(event.currentTarget.duration);
          }}
        />
      </div>
      {(title || duration !== undefined) && (
        <div className="flex min-w-0 items-center gap-2 px-1">
          {title ? <span className="min-w-0 flex-1 truncate text-base font-medium">{title}</span> : null}
          {duration !== undefined ? (
            <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
              {formatMediaDuration(duration)}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

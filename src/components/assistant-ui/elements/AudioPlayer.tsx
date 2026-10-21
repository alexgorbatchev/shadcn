import { Button } from "../../Button.js";
import { useMediaDuration } from "../hooks/useMediaDuration.js";
import type { JSX } from "react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
import { formatMediaDuration } from "../utils/formatMediaDuration.js";
export interface IAudioPlayerProps extends Omit<Omit<ComponentProps<"div">, "children">, "className" | "style"> {
  src: string;
  title?: string | undefined;
  artwork?: string | undefined;
  durationMs?: number | undefined;
}
export function AudioPlayer({ src, title, artwork, durationMs, ...props }: IAudioPlayerProps): JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playback, setPlayback] = useState({
    src,
    currentTime: 0,
    playing: false,
    hasError: false,
  });
  const { duration, setDurationFromMetadata } = useMediaDuration(audioRef, src, durationMs);
  const playbackState = playback.src === src ? playback : { src, currentTime: 0, playing: false, hasError: false };
  const { currentTime, playing, hasError } = playbackState;
  const update = (patch: Partial<Omit<typeof playback, "src">>) =>
    setPlayback((current) => ({
      ...(current.src === src ? current : { src, currentTime: 0, playing: false, hasError: false }),
      ...patch,
    }));
  const displayTitle = title ?? "Audio";
  const playbackLabel = title ? ` ${title}` : " audio";
  const durationLabel = duration === undefined ? "--:--" : formatMediaDuration(duration);
  useEffect(() => {
    if (audioRef.current?.error) {
      setPlayback({ src, currentTime: 0, playing: false, hasError: true });
    }
  }, [src]);
  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;
    if (playing) {
      audio.pause();
      update({ playing: false });
      return;
    }
    void audio.play().then(
      () => update({ playing: true }),
      () => update(audio.error ? { hasError: true, playing: false } : { playing: false }),
    );
  };
  return (
    <div
      data-testid="AudioPlayer"
      data-slot="audio-player"
      className={cn(paper, "flex w-full max-w-md items-center gap-3 rounded-md p-3")}
      {...props}
    >
      {artwork ? <img src={artwork} alt="" className="size-10 shrink-0 rounded-lg object-cover" /> : null}
      <Button
        variant="default"
        type="button"
        aria-label={`${playing ? "Pause" : "Play"}${playbackLabel}`}
        disabled={hasError}
        onClick={togglePlayback}
        size="icon"
      >
        {playing ? (
          <PauseIcon aria-hidden="true" data-icon="inline-start" />
        ) : (
          <PlayIcon aria-hidden="true" data-icon="inline-start" />
        )}
      </Button>
      <div className="flex min-w-0 grow basis-16 flex-col gap-1.5">
        <span className="truncate text-base font-medium">{displayTitle}</span>
        <input
          type="range"
          min={0}
          max={duration ?? 0}
          step={0.1}
          value={Math.min(currentTime, duration ?? 0)}
          aria-label="Seek"
          aria-valuetext={`${formatMediaDuration(currentTime)} of ${durationLabel}`}
          disabled={hasError}
          onChange={(event) => {
            const nextTime = Number(event.currentTarget.value);
            if (!Number.isFinite(nextTime)) return;
            const resolvedTime = Math.min(nextTime, duration ?? nextTime);
            if (audioRef.current) audioRef.current.currentTime = resolvedTime;
            update({ currentTime: resolvedTime });
          }}
          className="accent-foreground w-full cursor-pointer disabled:cursor-default"
        />
      </div>
      <span className={cn(mono, "text-muted-foreground tabular-nums")}>
        {formatMediaDuration(currentTime)}&nbsp;/ {durationLabel}
      </span>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(event) => {
          setDurationFromMetadata(event.currentTarget.duration);
        }}
        onTimeUpdate={(event) => update({ currentTime: event.currentTarget.currentTime })}
        onPlay={() => update({ playing: true })}
        onPause={() => update({ playing: false })}
        onError={() => update({ hasError: true, playing: false })}
      />
      {hasError ? (
        <span role="alert" className="text-muted-foreground text-sm">
          Can't play this audio
        </span>
      ) : null}
    </div>
  );
}

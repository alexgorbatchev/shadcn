import { useEffect, useState, type RefObject } from "react";
interface IMediaMetadata {
  src: string;
  duration?: number;
}
interface IMediaDurationResult {
  duration: number | undefined;
  setDurationFromMetadata: (duration: number) => void;
}

export function useMediaDuration(
  mediaRef: RefObject<HTMLMediaElement | null>,
  src: string,
  durationMs?: number | undefined,
): IMediaDurationResult {
  const [metadata, setMetadata] = useState<IMediaMetadata>({
    src,
  });

  // A server-rendered media element can load metadata before hydration attaches onLoadedMetadata.
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || media.readyState < HTMLMediaElement.HAVE_METADATA) return;
    if (Number.isFinite(media.duration) && media.duration >= 0) {
      setMetadata({ src, duration: media.duration });
    }
  }, [mediaRef, src]);
  const fallbackDuration =
    durationMs !== undefined && Number.isFinite(durationMs) ? Math.max(0, durationMs / 1000) : undefined;

  return {
    duration: metadata.src === src ? (metadata.duration ?? fallbackDuration) : fallbackDuration,
    setDurationFromMetadata: (duration: number) => {
      if (Number.isFinite(duration) && duration >= 0) {
        setMetadata({ src, duration });
      }
    },
  };
}

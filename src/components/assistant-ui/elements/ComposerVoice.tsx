import type { JSX } from "react";
import { type ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
import { clamp } from "../utils/range.js";
import { formatMediaDuration } from "../utils/formatMediaDuration.js";
export function ComposerVoice({ recording, seconds, audioLevels = [], ...props }: IComposerVoiceProps): JSX.Element {
  return (
    <div
      data-testid="ComposerVoice"
      data-slot="composer-voice"
      data-recording={recording || undefined}
      className={cn("flex min-h-11 items-center gap-3 ps-3")}
      {...props}
    >
      {recording && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-primary bg-primary" />}
      <div className="flex h-6 items-center gap-[3px]" aria-hidden>
        {audioLevels.map((level, index) => (
          <span
            data-testid="ComposerVoice--audio-level"
            key={index}
            className={cn(
              "w-0.5 rounded-full transition-[height,background-color] duration-150 motion-reduce:transition-none",
              recording ? "bg-foreground/50" : "bg-foreground/25",
            )}
            style={{ height: recording ? 3 + clamp(level, 0, 1) * 15 : 3 }}
          />
        ))}
      </div>
      {recording ? (
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>{formatMediaDuration(seconds)}</span>
      ) : (
        <ShimmerLabel role="status">Transcribing</ShimmerLabel>
      )}
    </div>
  );
}
interface IComposerVoiceProps extends Omit<Omit<ComponentProps<"div">, "children">, "className" | "style"> {
  recording: boolean;
  seconds: number;
  audioLevels?: readonly number[];
}

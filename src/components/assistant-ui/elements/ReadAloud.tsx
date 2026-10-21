import { Progress } from "../../Progress.js";
import { Button } from "../../Button.js";
import type { JSX } from "react";
type ReadAloudProps = Omit<
  ComponentProps<"div">,
  "children" | "words" | "spokenIndex" | "playing" | "rate" | "elapsed" | "duration" | "onToggle" | "onRateChange"
> & {
  words: readonly string[];
  spokenIndex: number;
  playing: boolean;
  rate: number;
  elapsed: string;
  duration: string;
  onToggle?: () => void;
  onRateChange?: () => void;
};
import type { ComponentProps } from "react";
import { PauseIcon, PlayIcon, Volume2Icon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { announced, pct } from "../utils/range.js";
export function ReadAloud({
  words,
  spokenIndex,
  playing,
  rate,
  elapsed,
  duration,
  onToggle,
  onRateChange,
  className,
  ...props
}: ReadAloudProps): JSX.Element {
  const progress = pct(spokenIndex, words.length);
  return (
    <div
      data-testid="ReadAloud"
      data-slot="read-aloud"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-3.5"), className)}
      {...props}
    >
      <p className="text-base leading-relaxed">
        {words.map((word, i) => (
          <span
            key={`${i}-${word}`}
            className={cn(
              "transition-colors duration-200 motion-reduce:transition-none",
              i < spokenIndex
                ? "text-muted-foreground"
                : i === spokenIndex
                  ? "text-foreground rounded bg-primary/12 bg-primary/15"
                  : "text-muted-foreground",
            )}
          >
            {word}{" "}
          </span>
        ))}
      </p>

      <div className="flex items-center gap-2.5">
        <Button type="button" aria-label={playing ? "Pause" : "Play"} onClick={onToggle} variant="ghost">
          {playing ? (
            <PauseIcon aria-hidden="true" data-icon="inline-start" />
          ) : (
            <PlayIcon aria-hidden="true" data-icon="inline-start" />
          )}
        </Button>

        <Progress
          aria-label="Read aloud progress"
          value={announced(progress)}
          aria-valuetext={`${elapsed} of ${duration}`}
        />

        <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
          {elapsed} / {duration}
        </span>

        <Button
          type="button"
          aria-label={`Playback speed, currently ${rate} times`}
          onClick={onRateChange}
          variant="ghost"
        >
          {rate}×
        </Button>

        <Volume2Icon aria-hidden="true" className={cn("size-4")} />
      </div>
    </div>
  );
}

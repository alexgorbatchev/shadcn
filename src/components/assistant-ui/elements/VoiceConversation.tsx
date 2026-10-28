import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { IConversationTurn } from "./types.js";
type VoiceConversationProps = Omit<
  ComponentProps<"div">,
  "children" | "mode" | "amplitude" | "transcript" | "muted" | "onToggleMute" | "onInterrupt" | "onEnd"
> & {
  mode: VoiceMode;
  amplitude: number;
  transcript: readonly IVoiceTurn[];
  muted?: boolean;
  onToggleMute?: () => void;
  onInterrupt?: () => void;
  onEnd?: () => void;
};
import type { ComponentProps } from "react";
import { MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { clamp } from "../utils/range.js";
export type VoiceMode = "connecting" | "listening" | "thinking" | "speaking";
export type IVoiceTurn = IConversationTurn;
const CAPTION: Record<VoiceMode, string> = {
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};
const HINT: Record<VoiceMode, string> = {
  connecting: "Opening the mic",
  listening: "Listening for you",
  thinking: "Working on it",
  speaking: "Playing the reply",
};
export function VoiceConversation({
  mode,
  amplitude,
  transcript,
  muted,
  onToggleMute,
  onInterrupt,
  onEnd,
  className,
  ...props
}: VoiceConversationProps): JSX.Element {
  const level = clamp(amplitude, 0, 1);
  const active = mode === "listening" || mode === "speaking";
  const canInterrupt = mode === "speaking" && onInterrupt !== undefined;
  return (
    <div
      data-testid="VoiceConversation"
      data-slot="voice-conversation"
      className={cn(cn(paper, "flex w-full max-w-xs flex-col items-center gap-4 rounded-md px-5 py-5"), className)}
      {...props}
    >
      <AnalyticsButton
        component="VoiceConversation"
        type="button"
        onClick={onInterrupt}
        disabled={!canInterrupt}
        aria-label="Interrupt the assistant"
        className="relative flex size-24 items-center justify-center rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-default"
      >
        <span
          aria-hidden
          className={cn(
            "absolute size-24 rounded-full transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
            mode === "speaking" ? "bg-primary/12 bg-primary/15" : "bg-foreground/[0.05]",
          )}
          style={{
            transform: `scale(${active ? 0.72 + level * 0.28 : 0.62})`,
            opacity: active ? 1 : 0.5,
          }}
        />
        <span
          aria-hidden
          className={cn(
            "absolute size-[68px] rounded-full transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none",
            mode === "speaking" ? "bg-primary/20 bg-primary/25" : "bg-foreground/[0.08]",
          )}
          style={{
            transform: `scale(${active ? 0.8 + level * 0.22 : 0.7})`,
          }}
        />
        <span
          aria-hidden
          className={cn(
            "relative size-10 rounded-full transition-[transform,background-color] duration-150 ease-out motion-reduce:transition-none",
            mode === "connecting" && "bg-foreground/20 animate-pulse",
            mode === "listening" && "bg-foreground/80",
            mode === "thinking" && "bg-foreground/30 animate-pulse",
            mode === "speaking" && "bg-primary bg-primary",
          )}
          style={{ transform: `scale(${active ? 0.9 + level * 0.2 : 0.85})` }}
        />
      </AnalyticsButton>

      <div className="flex flex-col items-center gap-1">
        <span className="text-base font-medium">{CAPTION[mode]}</span>
        <span className={cn(mono, "text-muted-foreground")}>
          {muted ? "Mic off" : canInterrupt ? "Tap to interrupt" : HINT[mode]}
        </span>
      </div>

      <div className="flex min-h-[72px] w-full flex-col gap-1.5">
        {transcript.map((turn) => (
          <div
            key={turn.id}
            className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex gap-2 text-sm leading-relaxed duration-300"
          >
            <span
              className={cn(
                mono,
                "w-8 shrink-0",
                turn.role === "user" ? "text-muted-foreground" : "text-primary text-primary",
              )}
            >
              {turn.role === "user" ? "you" : "ai"}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 break-words",
                turn.role === "user" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {turn.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          aria-label={muted ? "Turn the microphone on" : "Turn the microphone off"}
          aria-pressed={muted}
          onClick={onToggleMute}
          disabled={!onToggleMute}
          variant="ghost"
        >
          {muted ? (
            <MicOffIcon aria-hidden="true" data-icon="inline-start" />
          ) : (
            <MicIcon aria-hidden="true" data-icon="inline-start" />
          )}
        </Button>
        <Button type="button" aria-label="End the call" onClick={onEnd} disabled={!onEnd} variant="ghost" size="icon">
          <PhoneOffIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
      </div>
    </div>
  );
}

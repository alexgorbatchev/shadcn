import type { ReactElement } from "react";

import { cn } from "../../../utils/cn.js";
import { useVoiceState } from "@assistant-ui/react";

import { deriveVoiceOrbState } from "../utils/deriveVoiceOrbState.js";
export function VoiceStatusDot(): ReactElement {
  const voiceState = useVoiceState();
  const state = deriveVoiceOrbState(voiceState);
  return (
    <span
      data-testid="VoiceStatusDot"
      role="status"
      aria-label={`Voice ${state}`}
      className={cn(
        "aui-voice-status-dot size-2.5 shrink-0 rounded-full transition-all duration-300",
        state === "idle" && "bg-muted-foreground",
        state === "connecting" && "animate-pulse bg-warning",
        state === "listening" && "bg-success",
        state === "speaking" && "bg-success",
        state === "muted" && "bg-destructive",
      )}
    />
  );
}

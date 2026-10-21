import type { VoiceSessionState } from "@assistant-ui/react";
import type { VoiceOrbState } from "../elements/VoiceOrb.js";
export function deriveVoiceOrbState(voiceState: VoiceSessionState | undefined): VoiceOrbState {
  if (!voiceState) return "idle";
  if (voiceState.status.type === "starting") return "connecting";
  if (voiceState.status.type === "ended") return "idle";
  if (voiceState.isMuted) return "muted";
  if (voiceState.mode === "speaking") return "speaking";
  return "listening";
}

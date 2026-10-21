import type { ReactElement } from "react";
import { useVoiceControls, useVoiceState, useVoiceVolume, type VoiceSessionState } from "@assistant-ui/react";
import { useVoiceTranscript } from "../hooks/useVoiceTranscript.js";
import { VoiceConversation as VoiceConversationBase, type VoiceMode } from "../elements/VoiceConversation.js";
export type { VoiceMode, IVoiceTurn } from "../elements/VoiceConversation.js";
const deriveVoiceMode = (voice: VoiceSessionState | undefined): VoiceMode | undefined => {
  if (voice === undefined || voice.status.type === "ended") return undefined;
  if (voice.status.type === "starting") return "connecting";
  return voice.mode;
};
export function VoiceConversation(): ReactElement | null {
  const voice = useVoiceState();
  const amplitude = useVoiceVolume();
  const transcript = useVoiceTranscript();
  const { mute, unmute, disconnect } = useVoiceControls();
  const mode = deriveVoiceMode(voice);
  if (mode === undefined || voice === undefined) return null;
  return (
    <VoiceConversationBase
      mode={mode}
      amplitude={amplitude}
      transcript={transcript.slice(-2)}
      muted={voice.isMuted}
      onToggleMute={voice.isMuted ? unmute : mute}
      onEnd={disconnect}
    />
  );
}

import { type TextMessagePart, type ThreadMessage, useAuiState, useVoiceState } from "@assistant-ui/react";
import { useMemo, useState } from "react";
import type { IVoiceTurn } from "../elements/VoiceConversation.js";
const toIVoiceTurn = (message: ThreadMessage): IVoiceTurn => ({
  id: message.id,
  role: message.role === "user" ? "user" : "assistant",
  text: message.content
    .filter((part): part is TextMessagePart => part.type === "text")
    .map((part) => part.text)
    .join(""),
});
export const useVoiceTranscript = (): readonly IVoiceTurn[] => {
  const voice = useVoiceState();
  const active = voice !== undefined && voice.status.type !== "ended";
  const messages = useAuiState((s) => s.thread.messages);
  const [session, setSession] = useState({ active, start: messages.length });
  if (session.active !== active || (!active && session.start !== messages.length)) {
    setSession({ active, start: active ? session.start : messages.length });
  }
  const start = active ? session.start : messages.length;
  return useMemo(
    () =>
      messages
        .slice(start)
        .filter((message) => message.metadata.modality === "voice")
        .map(toIVoiceTurn),
    [messages, start],
  );
};

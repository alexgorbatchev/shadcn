import type { ReactElement } from "react";
import { TooltipIconButton } from "../elements/TooltipIconButton.js";

import { useVoiceControls, useVoiceState } from "@assistant-ui/react";
import { MicIcon, MicOffIcon } from "lucide-react";

export function VoiceMuteButton(): ReactElement {
  const voiceState = useVoiceState();
  const { mute, unmute } = useVoiceControls();
  const isMuted = voiceState?.isMuted ?? false;
  return (
    <TooltipIconButton
      tooltip={isMuted ? "Unmute" : "Mute"}
      disabled={voiceState === undefined || voiceState.status.type === "ended"}
      onClick={() => (isMuted ? unmute() : mute())}
    >
      {isMuted ? (
        <MicOffIcon aria-hidden="true" className="size-4 shrink-0" />
      ) : (
        <MicIcon aria-hidden="true" className="size-4 shrink-0" />
      )}
    </TooltipIconButton>
  );
}

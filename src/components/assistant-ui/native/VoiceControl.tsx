import type { ReactElement } from "react";

import { AuiIf } from "@assistant-ui/react";

import { VoiceStatusDot } from "./VoiceStatusDot.js";
import { VoiceConnectButton } from "./VoiceConnectButton.js";
import { VoiceMuteButton } from "./VoiceMuteButton.js";
import { VoiceDisconnectButton } from "./VoiceDisconnectButton.js";
export function VoiceControl(): ReactElement {
  return (
    <div data-testid="VoiceControl" className="flex items-center gap-2 border-b border-border px-2 py-1">
      <VoiceStatusDot />

      <AuiIf condition={(s) => s.thread.voice === undefined || s.thread.voice.status.type === "ended"}>
        <VoiceConnectButton />
      </AuiIf>

      <AuiIf condition={(s) => s.thread.voice?.status.type === "starting"}>
        <span className="aui-voice-status text-muted-foreground text-sm">Connecting...</span>
      </AuiIf>

      <AuiIf condition={(s) => s.thread.voice?.status.type === "running"}>
        <VoiceMuteButton />
        <VoiceDisconnectButton />
      </AuiIf>
    </div>
  );
}

import type { ReactElement } from "react";

import { Button } from "../../Button.js";

import { useAuiState, useVoiceControls } from "@assistant-ui/react";
import { PhoneIcon } from "lucide-react";

export function VoiceConnectButton(): ReactElement {
  const { connect } = useVoiceControls();
  const runOwnsThread = useAuiState(
    (s) => s.thread.isRunning || s.thread.messages.at(-1)?.status?.type === "requires-action",
  );
  return (
    <Button variant="default" disabled={runOwnsThread} onClick={() => connect()}>
      <PhoneIcon data-icon="inline-start" aria-hidden="true" /> Connect
    </Button>
  );
}

import type { ReactElement } from "react";
import { TooltipIconButton } from "../elements/TooltipIconButton.js";

import { useVoiceControls } from "@assistant-ui/react";
import { PhoneOffIcon } from "lucide-react";

export function VoiceDisconnectButton(): ReactElement {
  const { disconnect } = useVoiceControls();
  return (
    <TooltipIconButton tooltip="Disconnect" onClick={() => disconnect()}>
      <PhoneOffIcon aria-hidden="true" className="size-4 shrink-0" />
    </TooltipIconButton>
  );
}

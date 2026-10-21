import type { ReactElement } from "react";

import { useVoiceState, useVoiceVolume } from "@assistant-ui/react";

import { memo } from "react";
import { VoiceOrb as VoiceOrbBase, type VoiceOrbState, type VoiceOrbVariant } from "../elements/VoiceOrb.js";
import { deriveVoiceOrbState } from "../utils/deriveVoiceOrbState.js";
export type VoiceOrbProps = {
  state?: VoiceOrbState;
  variant?: VoiceOrbVariant;
};
export const VoiceOrb = memo(function VoiceOrb({ state: stateProp, ...rest }: VoiceOrbProps): ReactElement {
  const voiceState = useVoiceState();
  const volume = useVoiceVolume();
  const state = stateProp ?? deriveVoiceOrbState(voiceState);
  return <VoiceOrbBase state={state} volume={volume} {...rest} />;
});

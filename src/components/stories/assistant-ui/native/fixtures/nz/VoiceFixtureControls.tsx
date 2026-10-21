import type { JSX } from "react";
import { useAuiState, useVoiceControls, useVoiceState } from "@assistant-ui/react";
import { Button } from "../../../../../Button.js";
import type { IVoiceFixtureDriver } from "./createVoiceFixtureDriver.js";

interface IVoiceFixtureControlsProps {
  driver: IVoiceFixtureDriver;
}
export function VoiceFixtureControls({ driver }: IVoiceFixtureControlsProps): JSX.Element {
  const { connect } = useVoiceControls();
  const voice = useVoiceState();
  const isBlocked = useAuiState(
    (state) => state.thread.isRunning || state.thread.messages.at(-1)?.status?.type === "requires-action",
  );
  const hasSession = voice !== undefined && voice.status.type !== "ended";
  return (
    <div data-testid="VoiceFixtureControls">
      <Button disabled={hasSession || isBlocked} onClick={connect}>
        Start voice session
      </Button>
      <Button
        disabled={hasSession || isBlocked}
        onClick={() => {
          connect();
          driver.connected();
          driver.transcript("user", "First spoken turn");
        }}
      >
        Start with transcript
      </Button>
      <Button disabled={!hasSession} onClick={driver.connected}>
        Provider connected
      </Button>
      <Button disabled={!hasSession} onClick={driver.speaking}>
        Provider speaking
      </Button>
      <Button disabled={!hasSession} onClick={driver.listening}>
        Provider listening
      </Button>
      <Button disabled={!hasSession} onClick={() => driver.transcript("user", "Inspect the workspace")}>
        Provider user transcript
      </Button>
      <Button disabled={!hasSession} onClick={() => driver.transcript("assistant", "The workspace has been inspected")}>
        Provider assistant transcript
      </Button>
      <Button disabled={!hasSession} onClick={() => driver.volume(0.75)}>
        Provider volume
      </Button>
      <Button disabled={!hasSession} onClick={driver.end}>
        Provider ended
      </Button>
    </div>
  );
}

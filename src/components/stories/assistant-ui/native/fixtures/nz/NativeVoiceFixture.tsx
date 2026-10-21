import { useState, type JSX, type ReactNode } from "react";
import type { ThreadMessageLike } from "@assistant-ui/react";
import { NativeRuntimeFixture } from "../../helpers.js";
import { createVoiceFixtureDriver } from "./createVoiceFixtureDriver.js";
import { VoiceFixtureControls } from "./VoiceFixtureControls.js";

interface INativeVoiceFixtureProps {
  children: ReactNode;
  initialMessages?: readonly ThreadMessageLike[];
}
export function NativeVoiceFixture({ children, initialMessages }: INativeVoiceFixtureProps): JSX.Element {
  const [driver] = useState(createVoiceFixtureDriver);
  return (
    <NativeRuntimeFixture initialMessages={initialMessages} options={{ adapters: { voice: driver.adapter } }}>
      <VoiceFixtureControls driver={driver} />
      {children}
    </NativeRuntimeFixture>
  );
}

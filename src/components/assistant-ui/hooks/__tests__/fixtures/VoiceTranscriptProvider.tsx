import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import type { ReactElement, ReactNode } from "react";
import { createVoiceFixtureDriver } from "../../../../stories/assistant-ui/native/fixtures/nz/createVoiceFixtureDriver.js";

export function createVoiceTranscriptFixture() {
  const driver = createVoiceFixtureDriver();
  let connect: (() => void) | undefined;
  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    const runtime = useLocalRuntime(
      {
        async run() {
          return { content: [] };
        },
      },
      { adapters: { voice: driver.adapter } },
    );
    connect = () => runtime.thread.connectVoice();
    return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
  };
  return {
    Wrapper,
    driver,
    connect: () => {
      if (!connect) throw new Error("Mount the native provider first");
      connect();
    },
  };
}

import { createVoiceSession, type RealtimeVoiceAdapter, type VoiceSessionHelpers } from "@assistant-ui/react";

export interface IVoiceFixtureDriver {
  adapter: RealtimeVoiceAdapter;
  connected: () => void;
  speaking: () => void;
  listening: () => void;
  transcript: (role: "user" | "assistant", text: string) => void;
  volume: (value: number) => void;
  end: () => void;
}

/** A deterministic provider transport; the official session/runtime own all voice state. */
export function createVoiceFixtureDriver(): IVoiceFixtureDriver {
  let helpers: VoiceSessionHelpers | undefined;
  const session = (): VoiceSessionHelpers => {
    if (!helpers) throw new Error("Connect the actual voice runtime before emitting provider events");
    return helpers;
  };
  return {
    adapter: {
      connect(options) {
        const transport = new AbortController();
        return createVoiceSession(options, async (native) => {
          helpers = native;
          return {
            disconnect: () => transport.abort(),
            mute: () => native.emitVolume(0),
            unmute: () => native.emitVolume(0.75),
            sendText: async (text) => {
              if (!transport.signal.aborted)
                native.emitTranscript({ role: "assistant", text: `Voice received: ${text}`, isFinal: true });
            },
          };
        });
      },
    },
    connected: () => session().setStatus({ type: "running" }),
    speaking: () => session().emitMode("speaking"),
    listening: () => session().emitMode("listening"),
    transcript: (role, text) => session().emitTranscript({ role, text, isFinal: true }),
    volume: (value) => session().emitVolume(value),
    end: () => session().end("finished"),
  };
}

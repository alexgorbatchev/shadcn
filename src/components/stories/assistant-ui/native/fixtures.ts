import type { ChatModelAdapter, ChatModelRunResult, ThreadMessageLike } from "@assistant-ui/react";

export const fixture_chatModelAdapter: ChatModelAdapter = {
  async run(): Promise<ChatModelRunResult> {
    return { content: [{ type: "text", text: "Ready to help." }] };
  },
};

export const fixture_modelContextAdapter: ChatModelAdapter = {
  async run({ context }): Promise<ChatModelRunResult> {
    return { content: [{ type: "text", text: JSON.stringify(context.config) }] };
  },
};

export const fixture_pendingChatModelAdapter: ChatModelAdapter = {
  async *run({ abortSignal }) {
    yield { content: [{ type: "text", text: "Working on the request." }] };
    await new Promise<void>((resolve) => {
      if (abortSignal.aborted) resolve();
      else abortSignal.addEventListener("abort", () => resolve(), { once: true });
    });
  },
};

export const fixture_errorChatModelAdapter: ChatModelAdapter = {
  async run(): Promise<ChatModelRunResult> {
    throw new Error("The harness could not complete this request.");
  },
};

export const fixture_toolCallMessages: readonly ThreadMessageLike[] = [
  { role: "user", content: [{ type: "text", text: "Inspect the service." }] },
  {
    role: "assistant",
    content: [
      {
        type: "tool-call",
        toolCallId: "service-scan",
        toolName: "inspect_service",
        args: { service: "docs" },
        argsText: '{"service":"docs"}',
        result: { healthy: true },
      },
    ],
  },
];

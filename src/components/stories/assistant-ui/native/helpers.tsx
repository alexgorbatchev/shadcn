import { useState, type ComponentProps, type ReactElement, type ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  MessagePrimitive,
  ThreadPrimitive,
  useLocalRuntime,
  type ChatModelAdapter,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { PortalProvider } from "../../../PortalProvider.js";
import { MarkdownText } from "../../../assistant-ui/elements/MarkdownText.js";
import { fixture_chatModelAdapter } from "./fixtures.js";

interface INativeRuntimeFixtureProps {
  children: ReactNode;
  initialMessages?: readonly ThreadMessageLike[];
  adapter?: ChatModelAdapter;
  config?: ComponentProps<typeof AssistantRuntimeProvider>["config"];
  options?: Parameters<typeof useLocalRuntime>[1];
}
interface INativeMarkdownFixtureProps {
  text: string;
  components?: ComponentProps<typeof MarkdownText>["components"];
}

export function NativeRuntimeFixture({
  children,
  initialMessages,
  adapter = fixture_chatModelAdapter,
  config,
  options,
}: INativeRuntimeFixtureProps): ReactElement {
  const runtime = useLocalRuntime(adapter, { ...options, initialMessages });
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} data-testid="NativeRuntimeFixture" className="flex h-96 w-full min-w-0 flex-col">
      {container ? (
        <AssistantRuntimeProvider runtime={runtime} config={config}>
          <PortalProvider container={container}>{children}</PortalProvider>
        </AssistantRuntimeProvider>
      ) : null}
    </div>
  );
}
export function NativeMarkdownFixture({ text, components }: INativeMarkdownFixtureProps): ReactElement {
  return (
    <NativeRuntimeFixture initialMessages={[{ role: "assistant", content: [{ type: "text", text }] }]}>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root>
                <MessagePrimitive.Parts />
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root>
                <MessagePrimitive.Parts components={{ Text: () => <MarkdownText components={components} /> }} />
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  );
}

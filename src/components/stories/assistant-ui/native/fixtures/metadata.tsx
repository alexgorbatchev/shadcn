import type { ComponentProps, ReactElement, ReactNode } from "react";
import { MessagePrimitive, ThreadPrimitive, type ThreadMessageLike } from "@assistant-ui/react";
import { NativeRuntimeFixture } from "../helpers.js";

interface IMessageMetadataFixtureProps {
  messages: readonly ThreadMessageLike[];
  children?: ReactNode;
  components?: ComponentProps<typeof MessagePrimitive.Parts>["components"];
}

export function MessageMetadataFixture({ messages, children, components }: IMessageMetadataFixtureProps): ReactElement {
  function Message(): ReactElement {
    return (
      <MessagePrimitive.Root>
        <MessagePrimitive.Parts components={components} />
        {children}
      </MessagePrimitive.Root>
    );
  }
  return (
    <NativeRuntimeFixture initialMessages={messages}>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Messages components={{ UserMessage: Message, AssistantMessage: Message }} />
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  );
}

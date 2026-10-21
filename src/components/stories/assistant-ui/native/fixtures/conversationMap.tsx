import type { ComponentProps, ReactElement, ReactNode } from "react";
import { MessagePrimitive, ThreadPrimitive, type ThreadMessageLike } from "@assistant-ui/react";
import { ConversationMapAui } from "../../../../assistant-ui/native/ConversationMapAui.js";
import { NativeRuntimeFixture } from "../helpers.js";

const fixture_mapMessages: readonly ThreadMessageLike[] = Array.from(
  { length: 8 },
  (_, index) =>
    [
      { id: `question-${index}`, role: "user", content: `Question ${index + 1}` },
      { id: `answer-${index}`, role: "assistant", content: `Answer ${index + 1}` },
    ] satisfies ThreadMessageLike[],
).flat();

interface IConversationMapFixtureProps extends ComponentProps<typeof ConversationMapAui> {
  isEmpty?: boolean;
}
interface IConversationMapViewportFixtureProps {
  children: ReactNode;
  isEmpty?: boolean;
}

function MapMessage(): ReactElement {
  return (
    <MessagePrimitive.Root render={<div className="min-h-32 px-12 py-6" />}>
      <MessagePrimitive.Parts />
    </MessagePrimitive.Root>
  );
}

export function ConversationMapViewportFixture({
  isEmpty = false,
  children,
}: IConversationMapViewportFixtureProps): ReactElement {
  return (
    <NativeRuntimeFixture initialMessages={isEmpty ? [] : fixture_mapMessages}>
      <ThreadPrimitive.Root render={<div className="h-96" />}>
        <ThreadPrimitive.Viewport
          autoScroll={false}
          scrollToBottomOnInitialize={false}
          scrollToBottomOnThreadSwitch={false}
          aria-label="Conversation messages"
          role="region"
          render={<div className="relative h-full overflow-y-auto" />}
        >
          {children}
          <ThreadPrimitive.Messages components={{ UserMessage: MapMessage, AssistantMessage: MapMessage }} />
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  );
}

export function ConversationMapFixture({ isEmpty = false, ...props }: IConversationMapFixtureProps): ReactElement {
  return (
    <ConversationMapViewportFixture isEmpty={isEmpty}>
      <ConversationMapAui {...props} />
    </ConversationMapViewportFixture>
  );
}

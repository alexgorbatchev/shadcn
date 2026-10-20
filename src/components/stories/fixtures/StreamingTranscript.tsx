import type { ComponentProps, ReactElement } from "react";
import { useState } from "react";
import { Button } from "../../Button";
import { Bubble, BubbleContent } from "../../Bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../../message-scroller/MessageScroller";

export function StreamingTranscript({
  onPointerDown,
}: Pick<ComponentProps<typeof MessageScrollerViewport>, "onPointerDown">): ReactElement {
  const [chunks, setChunks] = useState(0);
  const [status, setStatus] = useState("Streaming");
  return (
    <MessageScrollerProvider autoScroll>
      <div className="flex w-full max-w-96 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setChunks((count) => count + 1)}>Receive chunk</Button>
          <Button onClick={() => setStatus("Stopped")}>Stop response</Button>
          <Button onClick={() => setStatus("Error")}>Fail response</Button>
          <Button onClick={() => setStatus("Streaming")}>Retry response</Button>
        </div>
        <output aria-label="Response status">{status}</output>
        <div className="h-64">
          <MessageScroller>
            <MessageScrollerViewport onPointerDown={onPointerDown}>
              <MessageScrollerContent className="gap-4 p-4" aria-busy={status === "Streaming"}>
                {Array.from({ length: 8 }, (_, index) => (
                  <MessageScrollerItem
                    key={index}
                    messageId={`interrupt-${index}`}
                    role="article"
                    aria-label={`Reply ${index}`}
                  >
                    <Bubble variant="muted">
                      <BubbleContent>
                        <p className="h-20">Reply {index}. Select this response to review it.</p>
                        {index === 7 &&
                          Array.from({ length: chunks }, (_, chunk) => (
                            <p className="h-20" key={chunk}>
                              Received chunk {chunk}
                            </p>
                          ))}
                      </BubbleContent>
                    </Bubble>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton behavior="instant" />
            <MessageScrollerButton direction="start" behavior="instant" />
          </MessageScroller>
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

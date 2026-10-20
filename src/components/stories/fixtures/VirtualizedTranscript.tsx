import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "../../Button";
import { Bubble, BubbleContent } from "../../Bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../../message-scroller/MessageScroller";

export function VirtualizedTranscript(): ReactElement {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const virtualizer = useVirtualizer({
    count: 1000,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 112,
    getItemKey: (index) => `virtual-${index}`,
    overscan: 8,
  });
  return (
    <MessageScrollerProvider defaultScrollPosition="start">
      <div className="flex w-full max-w-96 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => virtualizer.scrollToIndex(500, { align: "start" })}>Find virtual reply 500</Button>
          <Button onClick={() => virtualizer.scrollToIndex(0, { align: "start" })}>First virtual reply</Button>
          <Button onClick={() => setIsExpanded((value) => !value)}>Toggle reply details</Button>
        </div>
        <div className="h-64">
          <MessageScroller>
            <MessageScrollerViewport ref={viewportRef}>
              <MessageScrollerContent className="block min-h-full">
                <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
                  {virtualizer.getVirtualItems().map((item) => (
                    <article
                      key={item.key}
                      ref={virtualizer.measureElement}
                      data-index={item.index}
                      aria-label={`Virtual reply ${item.index}`}
                      className="absolute start-0 top-0 w-full p-2"
                      style={{ transform: `translateY(${item.start}px)` }}
                    >
                      <Bubble variant="muted">
                        <BubbleContent>
                          <p className="min-h-16">Virtual reply {item.index}</p>
                          {item.index === 500 && isExpanded && <p className="h-32">Expanded review context</p>}
                        </BubbleContent>
                      </Bubble>
                    </article>
                  ))}
                </div>
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

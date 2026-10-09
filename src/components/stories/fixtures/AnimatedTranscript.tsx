import type { ComponentProps, ReactElement } from "react";
import { Fragment, useState } from "react";
import { motion } from "motion/react";
import { useMediaQuery } from "usehooks-ts";
import { useMessageScroller } from "../../../hooks/useMessageScroller";
import { Button } from "../../Button";
import { Bubble, BubbleContent } from "../../Bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../../MessageScroller";

const MotionMessageScrollerItem = motion.create(MessageScrollerItem);
type AnimatedTranscriptProps = Pick<ComponentProps<typeof MotionMessageScrollerItem>, "onUpdate" | "ref">;

function AnimatedTranscriptControls(): ReactElement {
  const { scrollToMessage } = useMessageScroller();
  return <Button onClick={() => scrollToMessage("animated-0", { align: "start" })}>Find sent turn</Button>;
}

export function AnimatedTranscript({ onUpdate, ref }: AnimatedTranscriptProps): ReactElement {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [turns, setTurns] = useState<number[]>([]);
  return (
    <MessageScrollerProvider scrollPreviousItemPeek={16}>
      <div className="flex w-full max-w-96 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setTurns((values) => [...values, 0])}>Send animated turn</Button>
          <Button
            disabled={turns.length === 0}
            onClick={() =>
              setTurns((values) => values.map((chunks, index) => (index === values.length - 1 ? chunks + 1 : chunks)))
            }
          >
            Stream animated reply
          </Button>
          <AnimatedTranscriptControls />
        </div>
        <div className="h-64">
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="relative gap-4 border border-border p-4" aria-busy={turns.length > 0}>
                {Array.from({ length: 8 }, (_, index) => (
                  <MessageScrollerItem key={`history-${index}`} messageId={`animation-history-${index}`}>
                    <Bubble variant="muted">
                      <BubbleContent>
                        <p className="h-20">Saved exchange {index}</p>
                      </BubbleContent>
                    </Bubble>
                  </MessageScrollerItem>
                ))}
                {turns.map((chunks, index) => (
                  <Fragment key={index}>
                    <MotionMessageScrollerItem
                      ref={ref}
                      messageId={`animated-${index}`}
                      scrollAnchor
                      role="article"
                      aria-label={`Sent turn ${index}`}
                      initial={isReducedMotion ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "tween", duration: isReducedMotion ? 0 : 0.18, ease: "easeOut" }}
                      onUpdate={onUpdate}
                    >
                      <Bubble>
                        <BubbleContent>
                          <p className="h-20">Review request {index}</p>
                        </BubbleContent>
                      </Bubble>
                    </MotionMessageScrollerItem>
                    <MessageScrollerItem
                      messageId={`animated-reply-${index}`}
                      role="article"
                      aria-label={`Streamed reply ${index}`}
                    >
                      <Bubble variant="muted">
                        <BubbleContent>
                          <p className="h-20">Reviewing request {index}</p>
                          {Array.from({ length: chunks }, (_, chunk) => (
                            <p className="h-20" key={chunk}>
                              Review detail {chunk}
                            </p>
                          ))}
                        </BubbleContent>
                      </Bubble>
                    </MessageScrollerItem>
                  </Fragment>
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

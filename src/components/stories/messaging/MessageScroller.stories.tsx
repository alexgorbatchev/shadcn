import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Density } from "../../../density/types";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  MessageScroller,
  MessageScrollerProvider,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "../../message-scroller/MessageScroller";
import { useMessageScroller } from "../../message-scroller/hooks/useMessageScroller";
import { useMessageScrollerScrollable } from "../../message-scroller/hooks/useMessageScrollerScrollable";
import { useMessageScrollerVisibility } from "../../message-scroller/hooks/useMessageScrollerVisibility";
import { Button } from "../../Button";
import { Bubble, BubbleContent } from "../../Bubble";
import { Marker, MarkerContent } from "../../Marker";
import { AnimatedTranscript, StreamingTranscript, VirtualizedTranscript } from "../fixtures";

function Controls(): ReactElement {
  const { scrollToStart, scrollToEnd, scrollToMessage } = useMessageScroller();
  const { start, end } = useMessageScrollerScrollable();
  const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility();
  const [isFound, setIsFound] = useState<boolean | null>(null);
  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => scrollToStart()}>First reply</Button>
        <Button onClick={() => scrollToEnd()}>Latest reply</Button>
        <Button onClick={() => setIsFound(scrollToMessage("row-4", { align: "start" }))}>Find reply 4</Button>
        <Button onClick={() => setIsFound(scrollToMessage("missing"))}>Find missing reply</Button>
      </div>
      <output aria-label="Available edges">{JSON.stringify({ start, end })}</output>
      <output aria-label="Current anchor">{currentAnchorId ?? "none"}</output>
      <output aria-label="Visible replies">{visibleMessageIds.join(",")}</output>
      <output aria-label="Search result">{String(isFound)}</output>
    </>
  );
}
type TranscriptProps = ComponentProps<typeof MessageScrollerProvider> & {
  rowCount?: number;
  density?: Density;
  preserveScrollOnPrepend?: boolean;
  initialStreamCount?: number;
  rootRef?: ComponentProps<typeof MessageScroller>["ref"];
};
const viewportRef = fn();
function Transcript({
  rowCount = 8,
  density,
  preserveScrollOnPrepend,
  initialStreamCount = 0,
  rootRef,
  ...providerProps
}: TranscriptProps): ReactElement {
  const [rows, setRows] = useState(() => Array.from({ length: rowCount }, (_, index) => index));
  const [streamCount, setStreamCount] = useState(initialStreamCount);
  return (
    <MessageScrollerProvider {...providerProps}>
      <div className="flex w-96 flex-col gap-4">
        <div className="h-64">
          <MessageScroller density={density} ref={rootRef} role="group" aria-label="Transcript frame">
            <MessageScrollerViewport ref={viewportRef} preserveScrollOnPrepend={preserveScrollOnPrepend}>
              <MessageScrollerContent className="gap-4 p-4" aria-busy={streamCount > 0}>
                {rows.map((row) => (
                  <MessageScrollerItem
                    key={row}
                    messageId={`row-${row}`}
                    scrollAnchor={row % 2 === 0}
                    role="article"
                    aria-label={`Reply ${row}`}
                  >
                    <Bubble variant="muted">
                      <BubbleContent>
                        <p className="h-20">Reply {row}</p>
                        {row === rows.at(-1) &&
                          Array.from({ length: streamCount }, (_, index) => (
                            <p className="h-20" key={index}>
                              Stream chunk {index}
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
        <Controls />
        <div className="flex gap-2">
          <Button onClick={() => setRows([(rows[0] ?? 0) - 2, (rows[0] ?? 0) - 1, ...rows])}>Load history</Button>
          <Button onClick={() => setStreamCount(streamCount + 1)}>Stream reply</Button>
          <Button onClick={() => setRows([...rows, rows.length])}>Append turn</Button>
        </div>
      </div>
    </MessageScrollerProvider>
  );
}
const meta: Meta<typeof MessageScroller> = {
  title: "@alexgorbatchev/shadcn/components/messaging/MessageScroller",
  component: MessageScroller,
  tags: ["autodocs", "test"],
  render: (args) => <Transcript density={args.density} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

const animationUpdate = fn();
const animationRef = fn((element: HTMLDivElement | null) => ({ opacity: element?.style.opacity }));
export const AnimatedNewTurn: Story = {
  render: () => (
    <AnimatedTranscript
      onUpdate={(values) => animationUpdate({ ...values })}
      ref={(element) => {
        animationRef(element);
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvasElement.ownerDocument.fonts.ready;
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await userEvent.click(canvas.getByRole("button", { name: "Send animated turn" }));
    const turn = await canvas.findByRole("article", { name: "Sent turn 0" });
    await waitFor(() => expect(getComputedStyle(turn).opacity).toBe("1"));
    expect(animationUpdate.mock.calls.some(([values]) => values.y > 0 && values.opacity < 1)).toBe(
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(animationRef).toHaveBeenCalledWith(turn);
    expect(animationRef).toHaveReturnedWith({
      opacity: String(Number(matchMedia("(prefers-reduced-motion: reduce)").matches)),
    });
    expect(turn).toHaveAttribute("data-message-id", "animated-0");
    expect(turn).toHaveAttribute("data-scroll-anchor");
    await waitFor(() =>
      expect(turn.getBoundingClientRect().top).toBeCloseTo(viewport.getBoundingClientRect().top + 32, 0),
    );
    const top = turn.getBoundingClientRect().top;
    await userEvent.click(canvas.getByRole("button", { name: "Stream animated reply" }));
    await canvas.findByText("Review detail 0");
    expect(canvas.getByRole("article", { name: "Sent turn 0" })).toBe(turn);
    expect(turn.getBoundingClientRect().top).toBeCloseTo(top, 0);
    await userEvent.click(canvas.getByRole("button", { name: "Scroll to start" }));
    await waitFor(() => expect(viewport.scrollTop).toBe(0));
    await userEvent.click(canvas.getByRole("button", { name: "Find sent turn" }));
    await waitFor(() =>
      expect(turn.getBoundingClientRect().top).toBeCloseTo(viewport.getBoundingClientRect().top + 16, 0),
    );
    const firstReply = canvas.getByRole("article", { name: "Streamed reply 0" });
    const firstHeight = firstReply.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole("button", { name: "Send animated turn" }));
    await canvas.findByRole("article", { name: "Sent turn 1" });
    await userEvent.click(canvas.getByRole("button", { name: "Stream animated reply" }));
    await within(canvas.getByRole("article", { name: "Streamed reply 1" })).findByText("Review detail 0");
    expect(canvas.getByRole("article", { name: "Streamed reply 0" })).toBe(firstReply);
    expect(firstReply.getBoundingClientRect().height).toBe(firstHeight);
    expect(within(firstReply).queryByText("Review detail 1")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(getComputedStyle(canvas.getByRole("article", { name: "Sent turn 1" })).opacity).toBe("1"),
    );
  },
};

export const VirtualizedHistory: Story = {
  render: () => <VirtualizedTranscript />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await canvas.findByRole("article", { name: "Virtual reply 0" });
    expect(canvas.getAllByRole("article").length).toBeLessThan(40);
    await userEvent.click(canvas.getByRole("button", { name: "Find virtual reply 500" }));
    const reply = await canvas.findByRole("article", { name: "Virtual reply 500" });
    await waitFor(() => expect(reply.getBoundingClientRect().top).toBeCloseTo(viewport.getBoundingClientRect().top, 0));
    expect(canvas.queryByRole("article", { name: "Virtual reply 0" })).not.toBeInTheDocument();
    const height = reply.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole("button", { name: "Toggle reply details" }));
    await waitFor(() => expect(reply.getBoundingClientRect().height).toBeGreaterThan(height));
    await userEvent.click(canvas.getByRole("button", { name: "Scroll to end" }));
    await canvas.findByRole("article", { name: "Virtual reply 999" });
    await assertAtEnd(viewport);
    await userEvent.click(canvas.getByRole("button", { name: "First virtual reply" }));
    await canvas.findByRole("article", { name: "Virtual reply 0" });
    await waitFor(() => expect(viewport.scrollTop).toBe(0));
  },
};

export const InterruptedResponse: Story = {
  render: () => <StreamingTranscript />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await assertAtEnd(viewport);
    const reply = canvas.getByRole("article", { name: "Reply 7" });
    await userEvent.click(canvas.getByRole("button", { name: "Scroll to start" }));
    await waitFor(() => expect(viewport.scrollTop).toBe(0));
    await userEvent.click(canvas.getByRole("button", { name: "Stop response" }));
    expect(canvas.getByLabelText("Response status")).toHaveTextContent("Stopped");
    expect(canvas.getByRole("log")).toHaveAttribute("aria-busy", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Fail response" }));
    expect(canvas.getByLabelText("Response status")).toHaveTextContent("Error");
    await userEvent.click(canvas.getByRole("button", { name: "Retry response" }));
    await userEvent.click(canvas.getByRole("button", { name: "Receive chunk" }));
    await canvas.findByText("Received chunk 0");
    expect(viewport.scrollTop).toBe(0);
    expect(canvas.getByRole("article", { name: "Reply 7" })).toBe(reply);
    await userEvent.click(canvas.getByRole("button", { name: "Scroll to end" }));
    await assertAtEnd(viewport);
    await userEvent.click(canvas.getByRole("button", { name: "Receive chunk" }));
    await canvas.findByText("Received chunk 1");
    await assertAtEnd(viewport);
  },
};

async function getTranscriptCanvas(canvasElement: HTMLElement): Promise<ReturnType<typeof within>> {
  const canvas = within(canvasElement);
  await canvas.findByRole("region", { name: "Messages" });
  await canvas.findByRole("log");
  return canvas;
}

async function assertAtEnd(viewport: HTMLElement): Promise<void> {
  await waitFor(() =>
    expect(Math.abs(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop)).toBeLessThan(1),
  );
}
export const End: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await assertAtEnd(viewport);
    await expect(canvas.getByRole("log")).toHaveAttribute("aria-relevant", "additions");
    await expect(viewport).toHaveAttribute("tabindex", "0");
    await expect(viewportRef).toHaveBeenCalledWith(viewport);
    await expect(canvas.getByRole("button", { name: "Scroll to end" })).toHaveAttribute("inert");
  },
};
export const Start: Story = {
  render: () => <Transcript defaultScrollPosition="start" />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await expect(viewport.scrollTop).toBe(0);
    await expect(getComputedStyle(viewport).maskImage).not.toBe("none");
    for (let index = 0; index < 20; index++) {
      const endButton = await canvas.findByRole("button", { name: "Scroll to end" });
      await waitFor(() => expect(endButton).not.toHaveAttribute("inert"));
      await userEvent.click(endButton);
      await assertAtEnd(viewport);
      const startButton = await canvas.findByRole("button", { name: "Scroll to start" });
      await waitFor(() => expect(startButton).not.toHaveAttribute("inert"));
      await userEvent.click(startButton);
      await waitFor(() => expect(viewport.scrollTop).toBe(0));
    }
  },
};
export const LastAnchor: Story = {
  render: () => (
    <Transcript defaultScrollPosition="last-anchor" rowCount={10} initialStreamCount={2} scrollPreviousItemPeek={20} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await waitFor(() =>
      expect(canvas.getByRole("article", { name: "Reply 8" }).getBoundingClientRect().top).toBeCloseTo(
        viewport.getBoundingClientRect().top + 36,
        0,
      ),
    );
    await expect(viewport.scrollTop).toBeGreaterThan(0);
    await expect(viewport).not.toHaveAttribute("data-pending-scroll");
  },
};
export const Fits: Story = {
  render: () => <Transcript rowCount={1} />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    await waitFor(() => expect(canvas.getByText("Reply 0")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Scroll to end" })).toHaveAttribute("inert");
    await expect(canvas.getByRole("button", { name: "Scroll to start" })).toHaveAttribute("inert");
    await waitFor(() =>
      expect(canvas.getByLabelText("Available edges")).toHaveTextContent('{"start":false,"end":false}'),
    );
  },
};
export const Empty: Story = {
  render: () => <Transcript rowCount={0} />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    await expect(canvas.getByRole("region", { name: "Messages" })).toBeVisible();
    await expect(canvas.queryByText("Reply 0")).not.toBeInTheDocument();
    await expect(canvas.getByRole("region", { name: "Messages" })).not.toHaveAttribute("data-pending-scroll");
  },
};
export const CommandsAndVisibility: Story = {
  render: () => <Transcript defaultScrollPosition="start" scrollPreviousItemPeek={16} />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await userEvent.click(canvas.getByRole("button", { name: "Find reply 4" }));
    await expect(canvas.getByLabelText("Search result")).toHaveTextContent("true");
    await waitFor(() =>
      expect(canvas.getByLabelText("Visible replies").textContent?.split(",")).toEqual(
        expect.arrayContaining(["row-4"]),
      ),
    );
    await waitFor(() => expect(canvas.getByLabelText("Current anchor")).toHaveTextContent("row-4"));
    await waitFor(() =>
      expect(canvas.getByRole("article", { name: "Reply 4" }).getBoundingClientRect().top).toBeCloseTo(
        viewport.getBoundingClientRect().top + 16,
        0,
      ),
    );
    await expect(canvas.getByLabelText("Visible replies").textContent?.split(",")).toEqual(
      expect.arrayContaining(["row-4"]),
    );
    const top = viewport.scrollTop;
    await userEvent.click(canvas.getByRole("button", { name: "Find missing reply" }));
    await expect(canvas.getByLabelText("Search result")).toHaveTextContent("false");
    await expect(viewport.scrollTop).toBe(top);
  },
};
export const PrependHistory: Story = {
  render: () => <Transcript defaultScrollPosition="start" />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Find reply 4" }));
    await waitFor(() =>
      expect(canvas.getByLabelText("Visible replies").textContent?.split(",")).toEqual(
        expect.arrayContaining(["row-4"]),
      ),
    );
    const reply = canvas.getByRole("article", { name: "Reply 4" });
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await waitFor(() =>
      expect(reply.getBoundingClientRect().top).toBeCloseTo(viewport.getBoundingClientRect().top + 16, 0),
    );
    const before = reply.getBoundingClientRect().top;
    await userEvent.click(canvas.getByRole("button", { name: "Load history" }));
    await expect(canvas.getByText("Reply -2")).toBeInTheDocument();
    await waitFor(() => expect(reply.getBoundingClientRect().top).toBeCloseTo(before, 0));
  },
};
export const StreamAtLiveEdge: Story = {
  render: () => <Transcript autoScroll />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await assertAtEnd(viewport);
    await userEvent.click(canvas.getByRole("button", { name: "Stream reply" }));
    await expect(canvas.getByText("Stream chunk 0")).toBeInTheDocument();
    await assertAtEnd(viewport);
    await expect(canvas.getByRole("log")).toHaveAttribute("aria-busy", "true");
    await userEvent.click(canvas.getByRole("button", { name: "First reply" }));
    await waitFor(() => expect(viewport.scrollTop).toBe(0));
    await userEvent.click(canvas.getByRole("button", { name: "Stream reply" }));
    await expect(canvas.getByText("Stream chunk 1")).toBeInTheDocument();
    await expect(viewport.scrollTop).toBe(0);
    await userEvent.click(canvas.getByRole("button", { name: "Latest reply" }));
    await assertAtEnd(viewport);
  },
};
export const ReaderStaysPut: Story = {
  render: () => <Transcript defaultScrollPosition="start" />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await userEvent.click(canvas.getByRole("button", { name: "Stream reply" }));
    await expect(canvas.getByText("Stream chunk 0")).toBeInTheDocument();
    await expect(viewport.scrollTop).toBe(0);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Scroll to end" })).toBeVisible());
  },
};
export const Compact: Story = {
  args: { density: "compact" },
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    await assertAtEnd(canvas.getByRole("region", { name: "Messages" }));
    await expect(canvas.getByRole("button", { name: "Scroll to start" }).getBoundingClientRect().height).toBe(18);
  },
};
export const NewTurn: Story = {
  render: () => <Transcript defaultScrollPosition="start" scrollPreviousItemPeek={24} />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await userEvent.click(canvas.getByRole("button", { name: "Append turn" }));
    await waitFor(() =>
      expect(canvas.getByRole("article", { name: "Reply 8" }).getBoundingClientRect().top).toBeCloseTo(
        viewport.getBoundingClientRect().top + 40,
        0,
      ),
    );
    await expect(canvas.getByText("Reply 8")).toBeVisible();
  },
};
const customButtonClick = fn();
const customButtonRef = fn();
export const CustomControl: Story = {
  render: () => (
    <MessageScrollerProvider defaultScrollPosition="start">
      <div className="h-64 w-96">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {[0, 1, 2, 3].map((row) => (
                <MessageScrollerItem key={row} messageId={`custom-${row}`}>
                  <p className="h-32">Custom reply {row}</p>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton
            behavior="instant"
            onClick={customButtonClick}
            ref={customButtonRef}
            render={<Button variant="outline" size="sm" />}
          >
            Jump to latest
          </MessageScrollerButton>
        </MessageScroller>
      </div>
    </MessageScrollerProvider>
  ),
  play: async ({ canvasElement }) => {
    customButtonClick.mockClear();
    const canvas = await getTranscriptCanvas(canvasElement);
    const button = canvas.getByRole("button", { name: "Jump to latest" });
    await userEvent.tab();
    await expect(canvas.getByRole("region", { name: "Messages" })).toHaveFocus();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await assertAtEnd(canvas.getByRole("region", { name: "Messages" }));
    await expect(customButtonClick).toHaveBeenCalledTimes(1);
    await expect(customButtonRef).toHaveBeenCalledWith(button);
    await waitFor(() => expect(button).toHaveAttribute("inert"));
    await expect(button).toHaveAttribute("tabindex", "-1");
  },
};

const rootRef = fn();
export const NativeRootRef: Story = {
  render: () => <Transcript rootRef={rootRef} defaultScrollPosition="start" />,
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const root = canvas.getByRole("group", { name: "Transcript frame" });
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await expect(rootRef).toHaveBeenCalledWith(root);
    await waitFor(() => expect(viewport).toHaveAttribute("data-scrollable", "end"));
    await expect(root).toHaveAttribute("data-scrollable", "end");
    await userEvent.click(canvas.getByRole("button", { name: "Latest reply" }));
    await assertAtEnd(viewport);
    await waitFor(() => expect(root).toHaveAttribute("data-scrollable", "start"));
  },
};

function SavedThread(): ReactElement {
  const { scrollToMessage } = useMessageScroller();
  const [hasRows, setHasRows] = useState(false);
  const [isQueued, setIsQueued] = useState<boolean | null>(null);
  return (
    <div className="flex w-96 flex-col gap-4">
      <Button onClick={() => setIsQueued(scrollToMessage("saved-4", { align: "start", behavior: "instant" }))}>
        Open saved permalink
      </Button>
      <Button onClick={() => setHasRows(true)}>Load saved transcript</Button>
      <output aria-label="Permalink queued">{String(isQueued)}</output>
      <div className="h-64">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 p-4">
              {hasRows &&
                Array.from({ length: 8 }, (_, index) => (
                  <MessageScrollerItem
                    key={index}
                    messageId={`saved-${index}`}
                    role="article"
                    aria-label={`Saved reply ${index}`}
                  >
                    <Bubble variant="muted">
                      <BubbleContent>
                        <p className="h-20">Saved reply {index}</p>
                      </BubbleContent>
                    </Bubble>
                  </MessageScrollerItem>
                ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton behavior="instant" />
        </MessageScroller>
      </div>
    </div>
  );
}
export const QueuedPermalink: Story = {
  render: () => (
    <MessageScrollerProvider defaultScrollPosition="start">
      <SavedThread />
    </MessageScrollerProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open saved permalink" }));
    await expect(canvas.getByLabelText("Permalink queued")).toHaveTextContent("true");
    await expect(canvas.queryByRole("article")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Load saved transcript" }));
    const target = await canvas.findByRole("article", { name: "Saved reply 4" });
    const viewport = canvas.getByRole("region", { name: "Messages" });
    await waitFor(() =>
      expect(target.getBoundingClientRect().top).toBeCloseTo(viewport.getBoundingClientRect().top + 16, 0),
    );
    await expect(target).toBeVisible();
  },
};

export const SystemMarkerAnchor: Story = {
  render: () => (
    <MessageScrollerProvider defaultScrollPosition="last-anchor" scrollPreviousItemPeek={24}>
      <div className="h-64 w-96">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 p-4">
              {[0, 1, 2].map((index) => (
                <MessageScrollerItem key={index} messageId={`earlier-${index}`}>
                  <Bubble variant="muted">
                    <BubbleContent>
                      <p className="h-20">Earlier reply {index}</p>
                    </BubbleContent>
                  </Bubble>
                </MessageScrollerItem>
              ))}
              <MessageScrollerItem messageId="handoff" scrollAnchor role="article" aria-label="Team handoff">
                <Marker variant="separator">
                  <MarkerContent>Alex joined the review</MarkerContent>
                </Marker>
              </MessageScrollerItem>
              <MessageScrollerItem messageId="handoff-reply">
                <Bubble>
                  <BubbleContent>
                    <p className="h-80">The review continues with Alex.</p>
                  </BubbleContent>
                </Bubble>
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton behavior="instant" />
        </MessageScroller>
      </div>
      <Controls />
    </MessageScrollerProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = await getTranscriptCanvas(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Messages" });
    const anchor = canvas.getByRole("article", { name: "Team handoff" });
    await waitFor(() =>
      expect(anchor.getBoundingClientRect().top).toBeCloseTo(viewport.getBoundingClientRect().top + 40, 0),
    );
    await expect(canvas.getByText("Alex joined the review")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Latest reply" }));
    await assertAtEnd(viewport);
    await waitFor(() => expect(canvas.getByLabelText("Current anchor")).toHaveTextContent("handoff"));
  },
};

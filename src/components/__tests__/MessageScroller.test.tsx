import type { ComponentProps, ReactElement } from "react";
import type { Locator } from "vitest/browser";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server.browser";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { commands, userEvent } from "vitest/browser";
import { StreamingTranscript } from "../stories/fixtures";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../message-scroller/MessageScroller";
import "../../../.storybook/preview.css";

type ServerTranscriptProps = Pick<ComponentProps<typeof MessageScrollerProvider>, "defaultScrollPosition">;

test("translated anchor uses layout position inside positioned bordered content", async () => {
  await document.fonts.ready;
  const screen = await render(
    <MessageScrollerProvider defaultScrollPosition="last-anchor" scrollPreviousItemPeek={16}>
      <div className="h-64 w-80">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="relative gap-4 border border-border p-4">
              <MessageScrollerItem messageId="older">
                <p className="h-80">Earlier exchange</p>
              </MessageScrollerItem>
              <MessageScrollerItem
                messageId="translated"
                scrollAnchor
                role="article"
                aria-label="Translated turn"
                style={{ transform: "translateY(16px)" }}
              >
                <p className="h-20">Sent request</p>
              </MessageScrollerItem>
              <MessageScrollerItem messageId="translated-reply">
                <p className="h-80">Growing reply</p>
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </div>
    </MessageScrollerProvider>,
  );
  const viewport = screen.getByRole("region", { name: "Messages" }).element() as HTMLElement;
  const content = screen.getByRole("log").element() as HTMLElement;
  const anchor = screen.getByRole("article", { name: "Translated turn" }).element() as HTMLElement;
  expect(anchor.offsetParent).toBe(content);
  await expect
    .poll(() => anchor.offsetTop + content.offsetTop + content.clientTop - viewport.scrollTop)
    .toBeCloseTo(32, 0);
  expect(anchor.getBoundingClientRect().top - viewport.getBoundingClientRect().top).toBeCloseTo(48, 0);
});

function ServerTranscript({ defaultScrollPosition }: ServerTranscriptProps): ReactElement {
  return (
    <MessageScrollerProvider defaultScrollPosition={defaultScrollPosition}>
      <div className="h-64 w-80">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4">
              {Array.from({ length: 8 }, (_, index) => (
                <MessageScrollerItem key={index} messageId={`server-${index}`} scrollAnchor={index === 6}>
                  <p className="h-32">Saved reply {index}</p>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton behavior="instant" />
        </MessageScroller>
      </div>
    </MessageScrollerProvider>
  );
}

test.each([
  { position: "start", visibility: "visible", expected: 0, measure: (viewport: HTMLElement) => viewport.scrollTop },
  {
    position: "end",
    visibility: "hidden",
    expected: 0,
    measure: (viewport: HTMLElement) => Math.abs(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop),
  },
  {
    position: "last-anchor",
    visibility: "hidden",
    expected: 64,
    measure: (viewport: HTMLElement) =>
      viewport.querySelector<HTMLElement>('[data-message-id="server-6"]')!.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top,
  },
] as const)(
  "server markup hydrates its $position opening position",
  async ({ position, visibility, expected, measure }) => {
    await document.fonts.ready;
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerTranscript defaultScrollPosition={position} />);
    document.body.append(container);
    const viewport = container.querySelector<HTMLElement>('[role="region"]')!;
    const last = container.querySelector<HTMLElement>('[data-message-id="server-7"]')!;
    const beforeHydration = viewport.scrollTop;
    expect(beforeHydration).toBe(0);
    expect(getComputedStyle(viewport).visibility).toBe(visibility);
    const errors: unknown[] = [];
    const root = hydrateRoot(container, <ServerTranscript defaultScrollPosition={position} />, {
      onRecoverableError: (error) => errors.push(error),
    });
    try {
      await expect.poll(() => viewport.hasAttribute("data-pending-scroll")).toBe(false);
      expect(getComputedStyle(viewport).visibility).toBe("visible");
      expect(container.querySelector('[data-message-id="server-7"]')).toBe(last);
      expect(errors).toEqual([]);
      await expect.poll(() => measure(viewport)).toBeCloseTo(expected, 0);
    } finally {
      root.unmount();
      container.remove();
    }
  },
);

test.each([
  {
    input: "keyboard",
    interrupt: async (region: Locator) => {
      await region.click();
      await userEvent.keyboard("{PageUp}");
    },
  },
  {
    input: "wheel",
    interrupt: async () => {
      await commands.nativeWheel('[role="region"][aria-label="Messages"]', -400);
    },
  },
])("native $input interruption releases live following until the reader returns", async ({ interrupt }) => {
  const screen = await render(<StreamingTranscript />);
  const region = screen.getByRole("region", { name: "Messages" });
  const viewport = region.element();
  await expect.poll(() => Math.abs(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop)).toBeLessThan(1);
  await expect.poll(() => viewport.hasAttribute("data-autoscrolling")).toBe(false);
  const settled = new Promise<void>((resolve) =>
    viewport.addEventListener("scrollend", () => resolve(), { once: true }),
  );
  await interrupt(region);
  await settled;
  await expect.poll(() => viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop).toBeGreaterThan(64);
  await expect.poll(() => viewport.hasAttribute("data-autoscrolling")).toBe(false);
  const position = viewport.scrollTop;
  await screen.getByRole("button", { name: "Receive chunk" }).click();
  await expect.element(screen.getByText("Received chunk 0")).toBeInTheDocument();
  await expect.poll(() => viewport.scrollTop).toBeCloseTo(position, 0);
  await screen.getByRole("button", { name: "Scroll to end" }).click();
  await expect.poll(() => Math.abs(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop)).toBeLessThan(1);
  await screen.getByRole("button", { name: "Receive chunk" }).click();
  await expect.element(screen.getByText("Received chunk 1")).toBeInTheDocument();
  await expect.poll(() => Math.abs(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop)).toBeLessThan(1);
});

test("selecting response text releases live following", async () => {
  const pointerDown = vi.fn();
  const screen = await render(<StreamingTranscript onPointerDown={pointerDown} />);
  const viewport = screen.getByRole("region", { name: "Messages" }).element();
  await expect.poll(() => Math.abs(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop)).toBeLessThan(1);
  await expect.poll(() => viewport.hasAttribute("data-autoscrolling")).toBe(false);
  await screen.getByText("Reply 7. Select this response to review it.").dblClick();
  expect(window.getSelection()!.toString().length).toBeGreaterThan(0);
  expect(pointerDown).toHaveBeenCalledTimes(2);
  const position = viewport.scrollTop;
  await screen.getByRole("button", { name: "Receive chunk" }).click();
  await expect.element(screen.getByText("Received chunk 0")).toBeInTheDocument();
  await expect
    .poll(() => screen.getByRole("button", { name: "Scroll to end" }).element().hasAttribute("inert"))
    .toBe(false);
  await expect.poll(() => viewport.scrollTop).toBeCloseTo(position, 0);
});

import { expect, onTestFinished, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { LayoutGuard } from "../LayoutGuard";

async function settle(): Promise<void> {
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
}

test("shares document observation and disconnects only after the last guard unmounts", async () => {
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  onTestFinished(() => iframe.remove());
  const ownerDocument = iframe.contentDocument!;
  const query = vi.spyOn(ownerDocument, "querySelectorAll");
  onTestFinished(() => query.mockRestore());
  const first = await render(<LayoutGuard ownerDocument={ownerDocument} />);
  await settle();
  const initialCalls = query.mock.calls.length;
  expect(initialCalls).toBeGreaterThan(0);
  const second = await render(<LayoutGuard ownerDocument={ownerDocument} />);
  await settle();
  expect(query).toHaveBeenCalledTimes(initialCalls);
  await first.unmount();
  ownerDocument.body.append(ownerDocument.createElement("div"));
  await settle();
  expect(query.mock.calls.length).toBeGreaterThan(initialCalls);
  await second.unmount();
  const calls = query.mock.calls.length;
  ownerDocument.body.append(ownerDocument.createElement("div"));
  await settle();
  expect(query).toHaveBeenCalledTimes(calls);
});

test("accepts a document without a browsing context", async () => {
  const ownerDocument = document.implementation.createHTMLDocument();
  const query = vi.spyOn(ownerDocument, "querySelectorAll");
  onTestFinished(() => query.mockRestore());
  const screen = await render(<LayoutGuard ownerDocument={ownerDocument} />);
  await settle();
  expect(query).not.toHaveBeenCalled();
  await screen.unmount();
});

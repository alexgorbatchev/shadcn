import { assert, afterEach, beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { observeScrollGuards } from "../observeScrollGuards";

let surface: HTMLDivElement;
let content: HTMLDivElement;

beforeEach(() => {
  surface = document.createElement("div");
  surface.id = "guarded";
  surface.setAttribute("data-scroll", "none");
  surface.style.cssText = "width:100px;height:100px;overflow:auto";
  content = document.createElement("div");
  content.style.cssText = "width:50px;height:300px";
  surface.append(content);
  document.body.append(surface);
});

afterEach(() => surface.remove());

async function settle(): Promise<void> {
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
}

function monitor(): ReturnType<typeof vi.fn<(error: Error) => void>> {
  const report = vi.fn<(error: Error) => void>();
  const disconnect = observeScrollGuards(document, report);
  onTestFinished(disconnect);
  return report;
}

test("discovers arbitrary marked elements and reports their vertical scroll range once", async () => {
  const report = monitor();
  await expect.poll(() => report.mock.calls.length).toBe(1);
  expect(report.mock.calls[0]?.[0].message).toBe(
    '[shadcn] Scrolling is forbidden by data-scroll="none": <div id="guarded"> (vertical: 300px > 100px). ' +
      "Move scrolling content into a nested ScrollArea or another explicit scroll viewport.",
  );
  content.textContent = "Still overflowing";
  await settle();
  expect(report).toHaveBeenCalledTimes(1);
});

test("reports both axes and identifies component slots when no id is present", async () => {
  surface.removeAttribute("id");
  surface.setAttribute("data-slot", "card");
  content.style.width = "300px";
  const report = monitor();
  await expect.poll(() => report.mock.calls.length).toBe(1);
  expect(report.mock.calls[0]?.[0].message).toBe(
    '[shadcn] Scrolling is forbidden by data-scroll="none": <div data-slot="card"> ' +
      "(horizontal: 300px > 100px, vertical: 300px > 100px). " +
      "Move scrolling content into a nested ScrollArea or another explicit scroll viewport.",
  );
});

test.each(["hidden", "clip", "visible"])("allows %s overflow", async (overflow) => {
  surface.style.overflow = overflow;
  const report = monitor();
  await settle();
  expect(report).not.toHaveBeenCalled();
});

test("allows fitting content and detects resizing without DOM mutations", async () => {
  content.style.height = "50px";
  const report = monitor();
  await settle();
  expect(report).not.toHaveBeenCalled();
  await content.animate([{ height: "50px" }, { height: "300px" }], { duration: 50, fill: "forwards" }).finished;
  await expect.poll(() => report.mock.calls.length).toBe(1);
});

test("detects content and marker changes on elements mounted after observation starts", async () => {
  surface.removeAttribute("data-scroll");
  const report = monitor();
  await settle();
  expect(report).not.toHaveBeenCalled();
  surface.setAttribute("data-scroll", "none");
  await expect.poll(() => report.mock.calls.length).toBe(1);
  surface.removeAttribute("data-scroll");
  await settle();
  content.textContent = "Unmarked content";
  await settle();
  expect(report).toHaveBeenCalledTimes(1);
  const portal = document.createElement("section");
  portal.setAttribute("data-scroll", "none");
  portal.style.cssText = "width:100px;height:100px;overflow:auto";
  document.body.append(portal);
  onTestFinished(() => portal.remove());
  portal.append(content);
  await expect.poll(() => report.mock.calls.length).toBe(2);
  expect(report.mock.calls[1]?.[0].message).toBe(
    '[shadcn] Scrolling is forbidden by data-scroll="none": <section> (vertical: 300px > 100px). ' +
      "Move scrolling content into a nested ScrollArea or another explicit scroll viewport.",
  );
});

test("ignores hidden surfaces and reports a new violation after the previous one resolves", async () => {
  surface.style.display = "none";
  const report = monitor();
  await settle();
  expect(report).not.toHaveBeenCalled();
  surface.style.display = "block";
  surface.style.visibility = "hidden";
  await settle();
  expect(report).not.toHaveBeenCalled();
  surface.style.visibility = "visible";
  await expect.poll(() => report.mock.calls.length).toBe(1);
  content.style.height = "50px";
  await settle();
  content.style.height = "300px";
  await expect.poll(() => report.mock.calls.length).toBe(2);
});

test("allows intentional nested scrolling while the marked surface remains stationary", async () => {
  surface.style.overflow = "hidden";
  content.style.cssText = "height:100px;overflow:auto";
  const items = document.createElement("div");
  items.style.height = "300px";
  content.append(items);
  const report = monitor();
  content.scrollTop = 60;
  await settle();
  expect(content.scrollTop).toBe(60);
  expect(surface.scrollTop).toBe(0);
  expect(report).not.toHaveBeenCalled();
});

test("disconnect cancels pending checks and releases observers and listeners", async () => {
  const report = vi.fn<(error: Error) => void>();
  const disconnect = observeScrollGuards(document, report);
  disconnect();
  content.textContent = "Disconnected";
  window.dispatchEvent(new Event("resize"));
  document.dispatchEvent(new Event("load"));
  await settle();
  expect(report).not.toHaveBeenCalled();
});

test("throws an error by default after layout", () => {
  let callback: FrameRequestCallback | undefined;
  const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((scheduled) => {
    callback = scheduled;
    return 1;
  });
  onTestFinished(() => request.mockRestore());
  onTestFinished(observeScrollGuards(document));
  assert(callback);
  const check = callback;
  expect(() => check(0)).toThrow(
    '[shadcn] Scrolling is forbidden by data-scroll="none": <div id="guarded"> (vertical: 300px > 100px). ' +
      "Move scrolling content into a nested ScrollArea or another explicit scroll viewport.",
  );
});

test("documents without a browser window need no observation", () => {
  const report = vi.fn<(error: Error) => void>();
  const disconnect = observeScrollGuards(document.implementation.createHTMLDocument(), report);
  disconnect();
  expect(report).not.toHaveBeenCalled();
});

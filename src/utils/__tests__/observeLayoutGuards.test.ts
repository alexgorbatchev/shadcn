import { afterEach, beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { observeLayoutGuards } from "../observeLayoutGuards";

let boundary: HTMLDivElement;
let child: HTMLDivElement;
beforeEach(() => {
  boundary = document.createElement("div");
  boundary.setAttribute("data-layout-boundary", "");
  boundary.style.cssText = "width:100px;height:100px";
  child = document.createElement("div");
  child.style.cssText = "width:50px;height:50px";
  boundary.append(child);
  document.body.append(boundary);
});
afterEach(() => boundary.remove());
async function settle(): Promise<void> {
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
}
function monitor(): ReturnType<typeof vi.fn<(error: Error) => void>> {
  const report = vi.fn<(error: Error) => void>();
  onTestFinished(observeLayoutGuards(document, report));
  return report;
}

test("reports new violations once and reports recurrence after recovery", async () => {
  const report = monitor();
  await settle();
  expect(report).not.toHaveBeenCalled();
  child.style.width = "150px";
  await expect.poll(() => report.mock.calls.length).toBe(1);
  expect(report.mock.calls[0]?.[0].message).toContain("right edge by 50px");
  child.setAttribute("title", "Same geometry");
  await settle();
  expect(report).toHaveBeenCalledTimes(1);
  child.style.width = "50px";
  await settle();
  child.style.width = "150px";
  await expect.poll(() => report.mock.calls.length).toBe(2);
});

test("discovers boundaries added later and releases removed targets", async () => {
  boundary.removeAttribute("data-layout-boundary");
  const report = monitor();
  await settle();
  child.style.width = "150px";
  boundary.setAttribute("data-layout-boundary", "");
  await expect.poll(() => report.mock.calls.length).toBe(1);
  child.remove();
  await settle();
  boundary.append(child);
  await expect.poll(() => report.mock.calls.length).toBe(2);
});

test("waits for finite ancestor animations and checks their final geometry", async () => {
  const report = monitor();
  const animation = boundary.animate([{ width: "10px" }, { width: "100px" }], { duration: 80 });
  await animation.finished;
  await settle();
  expect(report).not.toHaveBeenCalled();
  const overflow = child.animate([{ width: "50px" }, { width: "150px" }], { duration: 80, fill: "forwards" });
  onTestFinished(() => overflow.cancel());
  await overflow.finished;
  await expect.poll(() => report.mock.calls.length).toBe(1);
});

test("unrelated and infinite animations do not suppress containment failures", async () => {
  const animation = boundary.animate([{ opacity: 0.9 }, { opacity: 1 }], { duration: 100, iterations: Infinity });
  onTestFinished(() => animation.cancel());
  const unrelated = document.body.appendChild(document.createElement("div"));
  const finite = unrelated.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 10000 });
  onTestFinished(() => {
    finite.cancel();
    unrelated.remove();
  });
  child.style.width = "150px";
  const report = monitor();
  await expect.poll(() => report.mock.calls.length).toBe(1);
});

test("disconnect cancels queued and animation-completion checks", async () => {
  const report = vi.fn<(error: Error) => void>();
  const disconnect = observeLayoutGuards(document, report);
  const animation = child.animate([{ width: "50px" }, { width: "150px" }], { duration: 80, fill: "forwards" });
  onTestFinished(() => animation.cancel());
  await settle();
  disconnect();
  await animation.finished;
  await settle();
  expect(report).not.toHaveBeenCalled();
});

test("checks a replayed transform animation after it finishes", async () => {
  const report = monitor();
  const animation = child.animate([{ transform: "translateX(0)" }, { transform: "translateX(100px)" }], {
    duration: 80,
    fill: "forwards",
  });
  onTestFinished(() => animation.cancel());
  await animation.finished;
  await expect.poll(() => report.mock.calls.length).toBe(1);
  animation.cancel();
  child.title = "Reset motion";
  await settle();
  animation.play();
  // A DOM update schedules a check while the replay is in progress.
  child.title = "Replayed motion";
  await animation.finished;
  await expect.poll(() => report.mock.calls.length).toBe(2);
});

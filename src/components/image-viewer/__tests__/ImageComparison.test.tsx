import { assert, beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { observeScrollGuards } from "../../../utils/observeScrollGuards";
import { Dialog, DialogContent, DialogTitle } from "../../Dialog";
import { ImageComparison } from "../ImageComparison";
import { createSvgImageUrl, type Rgba } from "./helpers";
import "../../../../.storybook/preview.css";

const WHITE: Rgba = [255, 255, 255, 255];
const before = {
  src: createSvgImageUrl(960, 600, WHITE, [
    { rect: { x: 600, y: 360, width: 160, height: 48 }, color: [37, 99, 235, 255] },
  ]),
  alt: "Before capture",
};
const after = {
  src: createSvgImageUrl(960, 600, WHITE, [
    { rect: { x: 600, y: 360, width: 160, height: 48 }, color: [220, 38, 38, 255] },
  ]),
  alt: "After capture",
};

beforeEach(async () => {
  await page.viewport(1280, 800);
});

test("dragging the swipe handle with a mouse captures the pointer and moves the divider", async () => {
  const screen = await render(
    <div className="h-120 w-160">
      <ImageComparison before={before} after={after} defaultMode="swipe" showToolbar={false} />
    </div>,
  );
  const slider = screen.getByRole("slider", { name: "Swipe divider" });
  await expect.element(slider).toHaveAttribute("aria-valuenow", "50");
  await expect
    .poll(() => screen.getByRole("img", { name: "After capture" }).element().getBoundingClientRect().width)
    .toBeGreaterThan(0);
  const control = slider.element().closest("[data-slot=image-swipe-divider-handle]")?.parentElement;
  assert(control);
  const captures: string[] = [];
  control.addEventListener("gotpointercapture", () => captures.push("got"));
  control.addEventListener("lostpointercapture", () => captures.push("lost"));
  const width = screen.getByRole("img", { name: "After capture" }).element().getBoundingClientRect().width;
  await commands.nativeScrub('[data-slot="image-swipe-divider-handle"]', -width * 0.3);
  // The tester scales its iframe, so page-pixel mouse movement maps to a slightly larger CSS distance.
  await expect.poll(() => Number(slider.element().getAttribute("aria-valuenow"))).toBeLessThan(25);
  expect(Number(slider.element().getAttribute("aria-valuenow"))).toBeGreaterThan(10);
  expect(captures).toEqual(["got", "lost"]);
});

test("original-size panes follow each other when one scrolls with the wheel", async () => {
  const screen = await render(
    <div className="h-120 w-160">
      <ImageComparison
        before={before}
        after={after}
        defaultMode="side-by-side"
        defaultZoom="original"
        showToolbar={false}
      />
    </div>,
  );
  const beforePane = screen.getByRole("region", { name: "Before" }).element();
  const afterPane = screen.getByRole("region", { name: "After" }).element();
  await expect.poll(() => beforePane.scrollHeight).toBeGreaterThan(beforePane.clientHeight);
  const start = beforePane.scrollTop;
  await commands.nativeWheel('[aria-label="Before"]', 120);
  await expect.poll(() => beforePane.scrollTop).toBeGreaterThan(start);
  await expect.poll(() => afterPane.scrollTop).toBe(beforePane.scrollTop);
  await commands.nativeWheel('[aria-label="After"]', -60);
  await expect.poll(() => afterPane.scrollTop).toBeLessThan(beforePane.scrollTop + 120);
  await expect.poll(() => beforePane.scrollTop).toBe(afterPane.scrollTop);
});

test("the toolbar sits beside a wide fullscreen comparison and below a narrow one", async () => {
  const screen = await render(
    <Dialog defaultOpen>
      <DialogContent size="fullscreen">
        <DialogTitle>Checkout evidence</DialogTitle>
        <ImageComparison before={before} after={after} />
      </DialogContent>
    </Dialog>,
  );
  const toolbar = screen.getByRole("group", { name: "Comparison controls" }).element();
  const stage = toolbar.parentElement?.querySelector("[data-slot=image-comparison-stage]");
  assert(stage);
  await expect
    .poll(() => toolbar.getBoundingClientRect().left)
    .toBeGreaterThanOrEqual(stage.getBoundingClientRect().right);
  expect(toolbar.getBoundingClientRect().top).toBe(stage.getBoundingClientRect().top);
  await expect.element(screen.getByText("Mode")).toBeVisible();
  await page.viewport(414, 800);
  await expect
    .poll(() => toolbar.getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(stage.getBoundingClientRect().bottom);
  expect(toolbar.getBoundingClientRect().left).toBe(stage.getBoundingClientRect().left);
  await expect.element(screen.getByRole("group", { name: "Mode" })).toBeVisible();
});

test.each(["toggle", "swipe", "side-by-side"] as const)(
  "%s mode keeps every non-scrolling surface stationary at both zoom levels",
  async (mode) => {
    const report = vi.fn<(error: Error) => void>();
    onTestFinished(observeScrollGuards(document, report));
    const screen = await render(
      <div className="h-120 w-160">
        <ImageComparison before={before} after={after} defaultMode={mode} defaultShowDifferences />
      </div>,
    );
    await expect
      .element(screen.getByRole("switch", { name: "Highlight differences" }))
      .toHaveAccessibleDescription("1 changed region");
    await screen.getByRole("button", { name: "Original size" }).click();
    await expect
      .poll(() => document.querySelector("[data-slot=image-viewport]")?.getAttribute("data-zoom"))
      .toBe("original");
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    expect(report).not.toHaveBeenCalled();
  },
);

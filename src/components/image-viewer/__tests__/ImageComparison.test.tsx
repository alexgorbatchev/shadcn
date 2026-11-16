import { assert, beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { observeScrollGuards } from "../../../utils/observeScrollGuards";
import { Dialog, DialogContent, DialogTitle } from "../../Dialog";
import { ImageComparison } from "../ImageComparison";
import { createSvgImageUrl, loadCrossOriginImage, type Rgba } from "./helpers";
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

test("changing the pair cancels a pending comparison, which runs again when the pair returns", async () => {
  // Hold the comparison at its first yield so the pair provably changes while it is pending.
  const gate = Promise.withResolvers<void>();
  let yields = 0;
  vi.stubGlobal("scheduler", {
    yield: () => {
      yields++;
      return gate.promise;
    },
  });
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  const screen = await render(
    <div className="h-120 w-160">
      <ImageComparison before={before} after={after} defaultShowDifferences />
    </div>,
  );
  const highlight = screen.getByRole("switch", { name: "Highlight differences" });
  await expect.poll(() => yields).toBe(1);
  await expect.element(highlight).toHaveAccessibleDescription("Comparing pixels…");
  await screen.rerender(
    <div className="h-120 w-160">
      <ImageComparison before={after} after={after} defaultShowDifferences />
    </div>,
  );
  gate.resolve();
  await expect.element(highlight).toHaveAccessibleDescription("No visible differences");
  await screen.rerender(
    <div className="h-120 w-160">
      <ImageComparison before={before} after={after} defaultShowDifferences />
    </div>,
  );
  await expect.element(highlight).toHaveAccessibleDescription("1 changed region");
});

test("pixels of a cross-origin image served without CORS cannot be compared", async () => {
  const crossOriginImage = await loadCrossOriginImage("/src/components/stories/fixtures/avatar.svg");
  const screen = await render(
    <div className="h-120 w-160">
      <ImageComparison
        before={{ src: crossOriginImage.src, alt: "Remote capture" }}
        after={after}
        defaultShowDifferences
      />
    </div>,
  );
  const highlight = screen.getByRole("switch", { name: "Highlight differences" });
  await expect
    .element(highlight)
    .toHaveAccessibleDescription("Pixels cannot be read: an image comes from another origin without CORS access.");
  await expect.element(highlight).toHaveAttribute("aria-disabled", "true");
  await expect.element(highlight).not.toBeChecked();
  expect(document.querySelector("[data-slot=image-difference-region]")).toBeNull();
});

test("a failed after image names the missing image in place of the comparison", async () => {
  const screen = await render(
    <div className="h-120 w-160">
      <ImageComparison before={before} after={{ src: "data:image/png;base64,AAAA", alt: "After capture" }} />
    </div>,
  );
  await expect.element(screen.getByText("The After image could not be loaded.", { exact: true })).toBeVisible();
  await expect
    .element(screen.getByRole("switch", { name: "Highlight differences" }))
    .toHaveAccessibleDescription("Pixels cannot be read: the After image could not be loaded.");
});

test.each([
  { shape: "wide", width: 2000, height: 200, axis: "scrollLeft" },
  { shape: "tall", width: 200, height: 2000, axis: "scrollTop" },
] as const)("switching modes keeps the viewed center of a $shape image that overflows one axis", async (image) => {
  const source = createSvgImageUrl(image.width, image.height, WHITE, [
    { rect: { x: 0, y: 0, width: 100, height: 100 }, color: [37, 99, 235, 255] },
  ]);
  const screen = await render(
    <div className="h-120 w-160">
      <ImageComparison
        before={{ src: source, alt: "Before capture" }}
        after={{ src: source, alt: "After capture" }}
        defaultZoom="original"
      />
    </div>,
  );
  const toggleViewport = screen.getByRole("region", { name: "After" }).element();
  await expect.poll(() => toggleViewport[image.axis]).toBeGreaterThan(0);
  toggleViewport.scrollTo({ left: 0, top: 0, behavior: "instant" });
  await expect.poll(() => toggleViewport[image.axis]).toBe(0);
  await new Promise(requestAnimationFrame);
  await screen.getByRole("button", { name: "Swipe" }).click();
  const swipeViewport = screen.getByRole("region", { name: "Before and After" }).element();
  await expect.poll(() => swipeViewport.scrollWidth + swipeViewport.scrollHeight).toBeGreaterThan(0);
  expect(swipeViewport[image.axis]).toBe(0);
});

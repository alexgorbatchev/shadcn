import { assert, beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { observeScrollGuards } from "../../../utils/observeScrollGuards";
import { SplitView } from "../../resizable/SplitView";
import { ImageComparison } from "../ImageComparison";
import { ImageGallery } from "../ImageGallery";
import { MediaShell } from "../MediaShell";
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
      <ImageComparison before={before} after={after} defaultMode="side-by-side" defaultZoom={1} showToolbar={false} />
    </div>,
  );
  const beforePane = screen.getByRole("region", { name: /^Before(, \d+%)?$/ }).element();
  const afterPane = screen.getByRole("region", { name: /^After(, \d+%)?$/ }).element();
  await expect.poll(() => beforePane.scrollHeight).toBeGreaterThan(beforePane.clientHeight);
  const start = beforePane.scrollTop;
  await commands.nativeWheel('[aria-label^="Before, "]', 120);
  await expect.poll(() => beforePane.scrollTop).toBeGreaterThan(start);
  await expect.poll(() => afterPane.scrollTop).toBe(beforePane.scrollTop);
  await commands.nativeWheel('[aria-label^="After, "]', -60);
  await expect.poll(() => afterPane.scrollTop).toBeLessThan(beforePane.scrollTop + 120);
  await expect.poll(() => beforePane.scrollTop).toBe(afterPane.scrollTop);
});

test("the toolbar sits above a wide fullscreen comparison in one row and side-by-side stacks vertically on a phone", async () => {
  const screen = await render(
    <MediaShell open onOpenChange={() => undefined} title="Checkout evidence">
      <div className="min-h-0 flex-1">
        <SplitView
          storageKey="native-comparison-phone-fill"
          sidebarPosition="end"
          sidebarOpen={false}
          narrowLayout="drawer"
          layout="fill"
          sidebarLabel="Comments"
          contentLabel="Image"
          resizeLabel="Resize comments"
          sidebarPadding="none"
          contentPadding="none"
          sidebar={<p>Comments</p>}
        >
          <ImageComparison before={before} after={after} defaultMode="side-by-side" defaultShowDifferences />
        </SplitView>
      </div>
    </MediaShell>,
  );
  await expect.element(screen.getByRole("group", { name: "Changed regions" })).toBeVisible();
  const toolbar = screen.getByRole("group", { name: "Comparison controls" }).element();
  const stage = toolbar.parentElement?.querySelector("[data-slot=image-comparison-stage]");
  assert(stage);
  await expect
    .poll(() => stage.getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(toolbar.getBoundingClientRect().bottom - 1);
  expect(stage.getBoundingClientRect().width).toBeCloseTo(toolbar.getBoundingClientRect().width, 0);
  // All direct control children (including the difference stepper) fit on one horizontal row at 1280x800.
  const visibleChildren = [...toolbar.children].filter(
    (child) => child instanceof HTMLElement && child.getBoundingClientRect().width > 0,
  );
  const tops = visibleChildren.map((child) => Math.round(child.getBoundingClientRect().top));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(8);

  const beforePane = screen.getByRole("region", { name: /^Before(, \d+%)?$/ }).element();
  const afterPane = screen.getByRole("region", { name: /^After(, \d+%)?$/ }).element();
  await expect
    .poll(() => beforePane.getBoundingClientRect().right)
    .toBeLessThanOrEqual(afterPane.getBoundingClientRect().left + 1);

  await page.viewport(390, 844);
  await expect
    .poll(() => afterPane.getBoundingClientRect().top - beforePane.getBoundingClientRect().bottom)
    .toBeGreaterThanOrEqual(-1);
  expect(beforePane.getBoundingClientRect().width).toBeCloseTo(stage.getBoundingClientRect().width, 0);
  // The difference controls wrap within the phone toolbar instead of overflowing horizontally.
  expect(toolbar.scrollWidth).toBeLessThanOrEqual(toolbar.clientWidth);
  // Both stacked panes keep visible height inside a narrow drawer SplitView rather than collapsing to zero.
  await expect
    .poll(() => screen.getByRole("img", { name: "Before capture" }).element().getBoundingClientRect().height)
    .toBeGreaterThan(100);
  await expect
    .poll(() => screen.getByRole("img", { name: "After capture" }).element().getBoundingClientRect().height)
    .toBeGreaterThan(100);
});

test("gallery compare-all preserves every card footer and scrolls to the last option on a phone", async () => {
  await page.viewport(390, 844);
  const items = [
    { key: "quiet", src: before.src, alt: "Quiet option", label: "Quiet", description: "Generous space." },
    { key: "bold", src: after.src, alt: "Bold option", label: "Bold", description: "Saturated accent." },
    {
      key: "playful",
      src: before.src,
      alt: "Playful option",
      label: "Playful",
      description: "Rounded shapes.",
      selected: true,
    },
  ];
  const screen = await render(
    <MediaShell open onOpenChange={() => undefined} title="Compare options · 3 options">
      <div className="flex min-h-0 flex-1 flex-col">
        <SplitView
          storageKey="native-gallery-phone-compare"
          sidebarPosition="end"
          sidebarOpen={false}
          narrowLayout="drawer"
          layout="fill"
          sidebarLabel="Comments"
          contentLabel="Image"
          resizeLabel="Resize comments"
          sidebarPadding="none"
          contentPadding="none"
          sidebar={<p>Comments</p>}
        >
          <ImageGallery
            items={items}
            index={0}
            onIndexChange={() => undefined}
            defaultCompareAll
            renderItemFooter={(entry) => (
              <button type="button">{entry.selected ? `${entry.label} chosen` : `Choose ${entry.label}`}</button>
            )}
          />
        </SplitView>
      </div>
    </MediaShell>,
  );
  const grid = document.querySelector<HTMLElement>("[data-slot=image-gallery-compare-grid]");
  assert(grid);
  await expect.poll(() => grid.scrollHeight).toBeGreaterThan(grid.clientHeight);
  // Every option card must keep its footer inside the card's own bounds (never clipped by overflow-hidden).
  for (const label of ["Quiet", "Bold", "Playful"]) {
    const pane = screen.getByRole("region", { name: label, exact: true }).element();
    const footer = pane.querySelector<HTMLElement>("[data-slot=image-gallery-compare-footer]");
    assert(footer);
    expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(pane.getBoundingClientRect().bottom + 1);
  }
  grid.scrollTo({ top: grid.scrollHeight, behavior: "instant" });
  const chosenBtn = screen.getByRole("button", { name: "Playful chosen" }).element();
  await expect.poll(() => chosenBtn.getBoundingClientRect().bottom).toBeLessThanOrEqual(844);
  expect(chosenBtn.getBoundingClientRect().top).toBeGreaterThan(0);
});

test("switching to original size centers the first change and stepping centers every change with scroll hints", async () => {
  const multiBefore = {
    src: createSvgImageUrl(1600, 900, WHITE, [
      { rect: { x: 40, y: 60, width: 120, height: 60 }, color: [37, 99, 235, 255] },
      { rect: { x: 1400, y: 760, width: 120, height: 60 }, color: [37, 99, 235, 255] },
    ]),
    alt: "Multi-change before",
  };
  const multiAfter = {
    src: createSvgImageUrl(1600, 900, WHITE, [
      { rect: { x: 40, y: 60, width: 120, height: 60 }, color: [220, 38, 38, 255] },
      { rect: { x: 1400, y: 760, width: 120, height: 60 }, color: [220, 38, 38, 255] },
    ]),
    alt: "Multi-change after",
  };
  const onCommentDifference = vi.fn();
  const screen = await render(
    <div className="h-120 w-180">
      <ImageComparison
        before={multiBefore}
        after={multiAfter}
        defaultMode="side-by-side"
        defaultShowDifferences
        onCommentDifference={onCommentDifference}
      />
    </div>,
  );
  await expect.element(screen.getByText("Change 1 of 2")).toBeVisible();
  await screen.getByRole("button", { name: "Original size" }).click();
  const beforePane = screen.getByRole("region", { name: /^Before, 100%$/ }).element();
  const afterPane = screen.getByRole("region", { name: /^After, 100%$/ }).element();
  // First change is near the top-left corner, so both panes open at the start edge rather than centered at 800,450.
  await expect.poll(() => beforePane.scrollLeft).toBe(0);
  expect(beforePane.scrollTop).toBe(0);
  expect(afterPane.scrollLeft).toBe(0);
  // Hidden content to the right and bottom shows visible scroll hints, while top/left edges do not.
  const beforeFrame = beforePane.closest("[data-slot=image-viewport-frame]");
  assert(beforeFrame);
  await expect.poll(() => beforeFrame.querySelector("[data-edge=right]")).not.toBeNull();
  expect(beforeFrame.querySelector("[data-edge=bottom]")).not.toBeNull();
  expect(beforeFrame.querySelector("[data-edge=left]")).toBeNull();

  const stepper = screen.getByRole("group", { name: "Changed regions" });
  await screen.getByRole("button", { name: "Next change" }).click();
  await expect.element(stepper.getByText("Change 2 of 2")).toBeVisible();
  await expect
    .poll(() => document.querySelector("[data-slot=image-comparison-change-announcement]")?.textContent)
    .toBe("Change 2 of 2");
  await expect.poll(() => beforePane.scrollLeft).toBeGreaterThan(200);
  expect(beforePane.scrollTop).toBeGreaterThan(200);
  expect(afterPane.scrollLeft).toBe(beforePane.scrollLeft);

  // Pressing 1 on the focused stage returns to the first change at 100%.
  afterPane.focus();
  await userEvent.keyboard("1");
  await expect.poll(() => beforePane.scrollLeft).toBe(0);
  await expect.element(stepper.getByText("Change 1 of 2")).toBeVisible();

  await screen.getByRole("button", { name: "Comment on change 1 of 2" }).click();
  expect(onCommentDifference).toHaveBeenCalledTimes(1);
  expect(onCommentDifference.mock.calls[0]?.[1]).toBe(0);
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
    await expect.poll(() => document.querySelector("[data-slot=image-viewport]")?.getAttribute("data-zoom")).toBe("1");
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
        defaultZoom={1}
      />
    </div>,
  );
  const toggleViewport = screen.getByRole("region", { name: /^After(, \d+%)?$/ }).element();
  await expect.poll(() => toggleViewport[image.axis]).toBeGreaterThan(0);
  toggleViewport.scrollTo({ left: 0, top: 0, behavior: "instant" });
  await expect.poll(() => toggleViewport[image.axis]).toBe(0);
  await new Promise(requestAnimationFrame);
  await screen.getByRole("button", { name: "Swipe" }).click();
  const swipeViewport = screen.getByRole("region", { name: /^Before and After(, \d+%)?$/ }).element();
  await expect.poll(() => swipeViewport.scrollWidth + swipeViewport.scrollHeight).toBeGreaterThan(0);
  expect(swipeViewport[image.axis]).toBe(0);
});

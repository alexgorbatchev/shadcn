import Color from "colorjs.io";
import { useState, type ReactElement } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ThemeProvider } from "../../ThemeProvider";
import { FramedImage } from "../FramedImage";
import { ImageRegionSelect } from "../ImageRegionSelect";
import { ImageViewer, type IImageViewerProps } from "../ImageViewer";
import type { IImageRect, ImageZoom } from "../types";
import { createSvgImageUrl } from "./helpers";
import "../../../../.storybook/preview.css";

const wide = createSvgImageUrl(1600, 1000, [241, 245, 249, 255]);
const tall = createSvgImageUrl(800, 1200, [241, 245, 249, 255]);

beforeEach(async () => {
  await page.viewport(1200, 900);
});

function Frame({ width = 800, height = 560, ...props }: IImageViewerProps & { width?: number; height?: number }) {
  return (
    <div style={{ width, height }} className="flex flex-col">
      <ImageViewer showZoomControl {...props} />
    </div>
  );
}

function getStage(name = "Dashboard"): HTMLElement {
  return page.getByRole("region", { name: new RegExp(`^${name}(, \\d+%)?$`) }).element() as HTMLElement;
}

async function expectScale(scale: number): Promise<void> {
  await expect.poll(() => Number(getStage().dataset.scale)).toBeCloseTo(scale, 3);
}

test("the stage is named by the image and its zoom, and the bar steps from fit up to 400% and back down to fit", async () => {
  const onZoomChange = vi.fn();
  await render(<Frame src={wide} alt="Dashboard" onZoomChange={onZoomChange} />);
  await expectScale(0.5);
  await expect.element(page.getByRole("region", { name: "Dashboard, 50%" })).toBeVisible();
  await expect.element(page.getByRole("button", { name: "Fit", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.element(page.getByRole("status", { name: "Zoom level" })).toHaveTextContent("50%");
  const zoomIn = page.getByRole("button", { name: "Zoom in" });
  const seen: number[] = [];
  for (let step = 0; step < 7; step++) {
    await zoomIn.click();
    seen.push(Number(getStage().dataset.scale));
  }
  expect(seen).toEqual([0.75, 1, 1.25, 1.5, 2, 3, 4]);
  await expect.element(zoomIn).toHaveAttribute("aria-disabled", "true");
  await expect.element(page.getByRole("status", { name: "Zoom level" })).toHaveTextContent("400%");
  await expect.element(page.getByRole("region", { name: "Dashboard, 400%" })).toBeVisible();
  const zoomOut = page.getByRole("button", { name: "Zoom out" });
  for (let step = 0; step < 7; step++) await zoomOut.click();
  await expect.poll(() => getStage().dataset.zoom).toBe("fit");
  await expect.element(zoomOut).toHaveAttribute("aria-disabled", "true");
  expect(onZoomChange).toHaveBeenLastCalledWith("fit");
});

test("fit width fills the stage's width and scrolls vertically", async () => {
  await render(<Frame src={wide} alt="Dashboard" height={400} defaultZoom="fit" />);
  await expect.poll(() => getStage().dataset.zoom).toBe("fit");
  await page.getByRole("button", { name: "Fit width" }).click();
  const stage = getStage();
  await expect.poll(() => stage.dataset.zoom).toBe("fit-width");
  await expect.poll(() => stage.scrollHeight).toBeGreaterThan(stage.clientHeight);
  const image = page.getByRole("img", { name: "Dashboard" }).element();
  await expect.poll(() => image.getBoundingClientRect().width).toBeCloseTo(stage.clientWidth, 0);
});

test("a tall image opens at fit width, never narrower than it was on the page", async () => {
  await render(<Frame src={tall} alt="Dashboard" width={1100} height={700} openingWidth={800} />);
  const stage = getStage();
  await expect.poll(() => stage.dataset.zoom).toBe("fit-width");
  await expect.element(page.getByRole("button", { name: "Fit width" })).toHaveAttribute("aria-pressed", "true");
  const image = page.getByRole("img", { name: "Dashboard" }).element();
  await expect.poll(() => image.getBoundingClientRect().width).toBeGreaterThanOrEqual(800);
  await expect.poll(() => stage.scrollHeight).toBeGreaterThan(stage.clientHeight);
  // Tall captures open at their top edge, where reading starts.
  expect(stage.scrollTop).toBe(0);
});

test("a wide image whose fit would shrink it below the page width opens at the page width", async () => {
  await render(<Frame src={wide} alt="Dashboard" width={500} height={900} openingWidth={700} />);
  await expectScale(700 / 1600);
  const image = page.getByRole("img", { name: "Dashboard" }).element();
  await expect.poll(() => image.getBoundingClientRect().width).toBeCloseTo(700, 0);
});

test("stage keys zoom, fit, show 100% and pan only while the image is larger than the stage", async () => {
  await render(<Frame src={wide} alt="Dashboard" />);
  await expectScale(0.5);
  const stage = getStage();
  expect(stage.getAttribute("aria-keyshortcuts")).toContain("ArrowLeft");
  stage.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(stage.scrollLeft).toBe(0);
  await userEvent.keyboard("+");
  await expectScale(0.75);
  await userEvent.keyboard("=");
  await expectScale(1);
  await userEvent.keyboard("-");
  await expectScale(0.75);
  await userEvent.keyboard("0");
  await expect.poll(() => stage.dataset.zoom).toBe("fit");
  await userEvent.keyboard("1");
  await expectScale(1);
  const left = stage.scrollLeft;
  const top = stage.scrollTop;
  await userEvent.keyboard("{ArrowRight}");
  await expect.poll(() => stage.scrollLeft).toBeGreaterThan(left);
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(() => stage.scrollTop).toBeGreaterThan(top);
  await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
  await expect.poll(() => stage.scrollLeft).toBe(left);
  await expect.poll(() => stage.scrollTop).toBe(top);
  // Mod with + stays the browser's own zoom.
  const event = new KeyboardEvent("keydown", { key: "+", ctrlKey: true, bubbles: true, cancelable: true });
  stage.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  await expectScale(1);
});

test("zooming keeps the viewed center", async () => {
  await render(<Frame src={wide} alt="Dashboard" />);
  await expectScale(0.5);
  const stage = getStage();
  stage.focus();
  await userEvent.keyboard("1");
  await expectScale(1);
  const center = (): { x: number; y: number } => ({
    x: (stage.scrollLeft + stage.clientWidth / 2) / stage.scrollWidth,
    y: (stage.scrollTop + stage.clientHeight / 2) / stage.scrollHeight,
  });
  stage.scrollTo({ left: 200, top: 120, behavior: "instant" });
  const before = center();
  await userEvent.keyboard("+");
  await expectScale(1.25);
  await expect.poll(() => center().x).toBeCloseTo(before.x, 2);
  expect(center().y).toBeCloseTo(before.y, 2);
});

test("an app key handler runs first and can replace a stage key", async () => {
  const onStageKeyDown = vi.fn((event: { key: string; preventDefault: () => void }) => {
    if (event.key === "+") event.preventDefault();
  });
  await render(<Frame src={wide} alt="Dashboard" onStageKeyDown={onStageKeyDown} stageKeyShortcuts="R" />);
  await expectScale(0.5);
  const stage = getStage();
  expect(stage.getAttribute("aria-keyshortcuts")).toMatch(/ R$/);
  stage.focus();
  await userEvent.keyboard("+r");
  expect(onStageKeyDown).toHaveBeenCalledTimes(2);
  await expectScale(0.5);
});

test("Mod+wheel zooms around the pointer while a plain wheel does not", async () => {
  await render(<Frame src={wide} alt="Dashboard" />);
  await expectScale(0.5);
  const stage = getStage();
  const box = stage.getBoundingClientRect();
  const wheel = (init: WheelEventInit): WheelEvent => {
    const event = new WheelEvent("wheel", {
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
      bubbles: true,
      cancelable: true,
      ...init,
    });
    stage.dispatchEvent(event);
    return event;
  };
  expect(wheel({ deltaY: -100 }).defaultPrevented).toBe(false);
  await expectScale(0.5);
  expect(wheel({ deltaY: -100, ctrlKey: true }).defaultPrevented).toBe(true);
  await expect.poll(() => Number(stage.dataset.scale)).toBeCloseTo(0.5 * Math.E, 2);
  wheel({ deltaY: -10, deltaMode: WheelEvent.DOM_DELTA_LINE, metaKey: true });
  await expectScale(4);
  wheel({ deltaY: 1, deltaMode: WheelEvent.DOM_DELTA_PAGE, ctrlKey: true });
  await expectScale(0.5);
});

test("a mouse drag pans the zoomed image and does not click what lies under it", async () => {
  const onClick = vi.fn();
  await render(
    <Frame
      src={wide}
      alt="Dashboard"
      defaultZoom={1}
      overlay={
        <button type="button" className="absolute inset-0" onClick={onClick}>
          Marker
        </button>
      }
    />,
  );
  await expectScale(1);
  const stage = getStage();
  expect(stage.hasAttribute("data-pannable")).toBe(true);
  const left = stage.scrollLeft;
  const top = stage.scrollTop;
  await commands.nativeSwipe("[data-slot=image-viewport]", -120, -80);
  // The pointer travels in page pixels, which the test frame may scale; the pan follows it in proportion.
  await expect.poll(() => stage.scrollLeft - left).toBeGreaterThan(100);
  expect((stage.scrollLeft - left) / (stage.scrollTop - top)).toBeCloseTo(1.5, 1);
  expect(onClick).not.toHaveBeenCalled();
  await page.getByRole("button", { name: "Marker" }).click();
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("one finger pans and two fingers pinch-zoom, with no touch reaching the overlay", async () => {
  const onClick = vi.fn();
  await render(
    <Frame
      src={wide}
      alt="Dashboard"
      defaultZoom={2}
      overlay={
        <button type="button" className="absolute inset-0" onClick={onClick}>
          Marker
        </button>
      }
    />,
  );
  await expectScale(2);
  const stage = getStage();
  const left = stage.scrollLeft;
  await commands.nativeTouch("[data-slot=image-viewport]", [
    [
      { x: 0, y: 0 },
      { x: -30, y: 0 },
      { x: -60, y: 0 },
      { x: -90, y: 0 },
    ],
  ]);
  await expect.poll(() => stage.scrollLeft).toBeCloseTo(left + 90, -1);
  expect(onClick).not.toHaveBeenCalled();
  await commands.nativeTouch("[data-slot=image-viewport]", [
    [
      { x: -50, y: 0 },
      { x: -75, y: 0 },
      { x: -100, y: 0 },
    ],
    [
      { x: 50, y: 0 },
      { x: 75, y: 0 },
      { x: 100, y: 0 },
    ],
  ]);
  await expectScale(4);
  await expect.element(page.getByRole("region", { name: "Dashboard, 400%" })).toBeVisible();
  expect(onClick).not.toHaveBeenCalled();
});

interface IRegionToolProps {
  onSelect: (region: IImageRect) => void;
}

function RegionTool({ onSelect }: IRegionToolProps): ReactElement {
  const [zoom, setZoom] = useState<ImageZoom>(1);
  return (
    <Frame
      src={wide}
      alt="Dashboard"
      zoom={zoom}
      onZoomChange={setZoom}
      overlay={<ImageRegionSelect onRegionChange={onSelect} />}
    />
  );
}

test("with the region tool on, one finger draws a region and two fingers still pinch-zoom", async () => {
  const onSelect = vi.fn();
  await render(<RegionTool onSelect={onSelect} />);
  await expectScale(1);
  const stage = getStage();
  const left = stage.scrollLeft;
  await commands.nativeTouch("[data-slot=image-region-select]", [
    [
      { x: 0, y: 0 },
      { x: 40, y: 20 },
      { x: 80, y: 40 },
    ],
  ]);
  await expect.poll(() => onSelect.mock.calls.length).toBe(1);
  expect(stage.scrollLeft).toBe(left);
  const [region] = onSelect.mock.calls[0] as [IImageRect];
  expect(region.width).toBeCloseTo(80 / 1600, 3);
  expect(region.height).toBeCloseTo(40 / 1000, 3);
  await commands.nativeTouch("[data-slot=image-region-select]", [
    [
      { x: -40, y: 0 },
      { x: -60, y: 0 },
      { x: -80, y: 0 },
    ],
    [
      { x: 40, y: 0 },
      { x: 60, y: 0 },
      { x: 80, y: 0 },
    ],
  ]);
  await expectScale(2);
  expect(onSelect).toHaveBeenCalledTimes(1);
  await expect.poll(() => document.querySelector("[data-slot=image-region-select-draft]")).toBeNull();
});

test("a mouse drag on the region tool draws a region, and a click places a half-size region", async () => {
  const onSelect = vi.fn();
  await render(<RegionTool onSelect={onSelect} />);
  await expectScale(1);
  await commands.nativeSwipe("[data-slot=image-region-select]", 160, 100);
  await expect.poll(() => onSelect.mock.calls.length).toBe(1);
  const [region] = onSelect.mock.calls[0] as [IImageRect];
  // The pointer travels in page pixels, which the test frame may scale; the region keeps the drag's proportions.
  expect(region.width).toBeGreaterThan(0.09);
  expect((region.width * 1600) / (region.height * 1000)).toBeCloseTo(1.6, 1);
});

function getContrast(foreground: string, background: string): number {
  return Math.abs(new Color(foreground).contrast(new Color(background), "WCAG21"));
}

test.each(["light", "dark"] as const)("framed images keep a 3:1 edge in the %s theme", async (theme) => {
  const screenshot = theme === "light" ? "#ffffff" : "#000000";
  const image = createSvgImageUrl(400, 300, theme === "light" ? [255, 255, 255, 255] : [0, 0, 0, 255]);
  await render(
    <ThemeProvider forcedTheme={theme}>
      <div className="bg-background p-4" data-testid="page">
        <FramedImage src={image} alt="Evidence" />
        <div style={{ width: 400, height: 300 }} className="flex flex-col">
          <ImageViewer src={image} alt="Stage" />
        </div>
      </div>
    </ThemeProvider>,
  );
  const page_ = page.getByTestId("page").element();
  const background = getComputedStyle(page_).backgroundColor;
  const framed = page.getByRole("img", { name: "Evidence" }).element();
  const edge = getComputedStyle(framed).borderTopColor;
  expect(getComputedStyle(framed).borderTopWidth).toBe("1px");
  expect(getContrast(edge, background)).toBeGreaterThanOrEqual(3);
  expect(getContrast(edge, screenshot)).toBeGreaterThanOrEqual(3);
  const stageImage = page.getByRole("img", { name: "Stage" }).element();
  const outline = getComputedStyle(stageImage);
  expect(outline.outlineWidth).toBe("1px");
  expect(getContrast(outline.outlineColor, background)).toBeGreaterThanOrEqual(3);
});

test("framed images are capped at 70% of the viewport height without cropping, or fill their column", async () => {
  await page.viewport(1440, 900);
  await render(
    <div style={{ width: 900 }}>
      <FramedImage src={tall} alt="Tall page" />
      <FramedImage src={wide} alt="Thumbnail" size="fill" />
    </div>,
  );
  const capped = page.getByRole("img", { name: "Tall page" }).element();
  await expect.poll(() => capped.getBoundingClientRect().height).toBeCloseTo(630, 0);
  const box = capped.getBoundingClientRect();
  expect(box.width / box.height).toBeCloseTo(800 / 1200, 1);
  const filled = page.getByRole("img", { name: "Thumbnail" }).element();
  await expect.poll(() => filled.getBoundingClientRect().width).toBe(900);
});

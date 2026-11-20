import type { ReactElement } from "react";
import Color from "colorjs.io";
import { expect, onTestFinished, test } from "vitest";
import { render } from "vitest-browser-react";
import { commands, page } from "vitest/browser";
import { ThemeProvider } from "../../ThemeProvider";
import { ImageRegionMarker, ImageRegionMarkerBadge, type ImageRegionMarkerVariant } from "../ImageRegionMarker";
import "../../../../.storybook/preview.css";

type Theme = "light" | "dark";
type Rgb = readonly [number, number, number];

const SCREENSHOT_COLORS = ["#ffffff", "#000000", "#1e293b"] as const;
const REGION = { left: 60, top: 40, width: 120, height: 60 };

interface IRegionFixtureProps {
  theme: Theme;
  screenshot: string;
  variant: ImageRegionMarkerVariant;
}

function RegionFixture({ theme, screenshot, variant }: IRegionFixtureProps): ReactElement {
  return (
    <ThemeProvider forcedTheme={theme}>
      <div data-testid="screenshot" className="relative" style={{ width: 240, height: 140, background: screenshot }}>
        <ImageRegionMarker variant={variant} region={REGION}>
          <ImageRegionMarkerBadge position={{ left: REGION.width + 8, top: -32 }}>
            <button type="button" className="h-6 w-10 rounded-sm bg-secondary text-secondary-foreground">
              3
            </button>
          </ImageRegionMarkerBadge>
        </ImageRegionMarker>
      </div>
    </ThemeProvider>
  );
}

/** Decodes an element screenshot so tests measure the pixels the browser painted. */
async function readPixels(base64: string): Promise<ImageData> {
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function pixelAt(pixels: ImageData, x: number, y: number): Rgb {
  const offset = (Math.round(y) * pixels.width + Math.round(x)) * 4;
  return [pixels.data[offset] ?? 0, pixels.data[offset + 1] ?? 0, pixels.data[offset + 2] ?? 0];
}

function toColor([red, green, blue]: Rgb): Color {
  return new Color("srgb", [red / 255, green / 255, blue / 255]);
}

function contrast(first: Rgb, second: Rgb): number {
  return toColor(first).contrastWCAG21(toColor(second));
}

async function capture(): Promise<{ pixels: ImageData; scale: number }> {
  await page.viewport(800, 600);
  const screenshot = page.getByTestId("screenshot");
  const pixels = await readPixels(await page.screenshot({ element: screenshot, save: false }));
  return { pixels, scale: pixels.width / 240 };
}

for (const theme of ["light", "dark"] as const) {
  for (const screenshot of SCREENSHOT_COLORS) {
    test(`a ${theme} comment region keeps 3:1 against the pixels on both sides of its outline on ${screenshot}`, async () => {
      await render(<RegionFixture theme={theme} screenshot={screenshot} variant="comment" />);
      const { pixels, scale } = await capture();
      const row = (REGION.top + REGION.height / 2) * scale;
      // The outline is 2px wide and starts 1px outside the region; the halo extends 4px past the region edge.
      const outline = pixelAt(pixels, (REGION.left - 2.5) * scale, row);
      const inside = pixelAt(pixels, (REGION.left - 1) * scale, row);
      const outside = pixelAt(pixels, (REGION.left - 4) * scale, row);
      expect(contrast(outline, inside)).toBeGreaterThanOrEqual(3);
      expect(contrast(outline, outside)).toBeGreaterThanOrEqual(3);
    });

    test(`a ${theme} region badge keeps a 3:1 edge on ${screenshot}`, async () => {
      await render(<RegionFixture theme={theme} screenshot={screenshot} variant="comment" />);
      const { pixels, scale } = await capture();
      const badgeLeft = REGION.left + REGION.width + 8;
      const row = (REGION.top - 32 + 12) * scale;
      const fill = pixelAt(pixels, (badgeLeft + 4) * scale, row);
      const edge = pixelAt(pixels, (badgeLeft - 1.5) * scale, row);
      const halo = pixelAt(pixels, (badgeLeft - 3.5) * scale, row);
      expect(contrast(edge, fill)).toBeGreaterThanOrEqual(3);
      expect(contrast(edge, halo)).toBeGreaterThanOrEqual(3);
    });
  }
}

test("draft and difference regions keep the same contrast-safe outline", async () => {
  for (const variant of ["draft", "difference"] as const) {
    const screen = await render(<RegionFixture theme="light" screenshot="#1e293b" variant={variant} />);
    const marker = screen.container.querySelector<HTMLElement>("[data-slot=image-region-marker]");
    expect(marker?.dataset.variant).toBe(variant);
    const style = getComputedStyle(marker ?? document.body);
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("1px");
    expect(style.outlineStyle).toBe(variant === "draft" ? "dashed" : "solid");
    expect(style.boxShadow).toContain("4px");
    await screen.unmount();
  }
});

test("forced colours draw the region and its badge in the system Highlight colour", async () => {
  await commands.emulateForcedColors("active");
  onTestFinished(() => commands.emulateForcedColors(null));
  const screen = await render(<RegionFixture theme="dark" screenshot="#1e293b" variant="comment" />);
  const marker = screen.container.querySelector("[data-slot=image-region-marker]");
  const badge = screen.container.querySelector("[data-slot=image-region-marker-badge]");
  const highlight = document.createElement("div");
  highlight.style.color = "Highlight";
  document.body.append(highlight);
  onTestFinished(() => highlight.remove());
  const expected = getComputedStyle(highlight).color;
  expect(getComputedStyle(marker ?? document.body).outlineColor).toBe(expected);
  expect(getComputedStyle(badge ?? document.body).outlineColor).toBe(expected);
});

for (const theme of ["light", "dark"] as const) {
  test(`the ${theme} target emphasis keeps one of its lines at 3:1 against any content`, async () => {
    await render(
      <ThemeProvider forcedTheme={theme}>
        <div data-testid="screenshot" className="relative bg-background" style={{ width: 240, height: 140 }}>
          <div className="absolute target-emphasis" style={REGION} />
        </div>
      </ThemeProvider>,
    );
    const { pixels, scale } = await capture();
    const row = (REGION.top + REGION.height / 2) * scale;
    const light = pixelAt(pixels, (REGION.left - 1.5) * scale, row);
    const dark = pixelAt(pixels, (REGION.left - 3.5) * scale, row);
    expect(contrast(light, dark)).toBeGreaterThanOrEqual(3);
    for (let value = 0; value <= 255; value += 5) {
      const content: Rgb = [value, value, value];
      expect(Math.max(contrast(light, content), contrast(dark, content))).toBeGreaterThanOrEqual(3);
    }
    for (const accent of [
      [184, 22, 140],
      [255, 92, 214],
      [255, 178, 36],
      [37, 99, 235],
    ] as const) {
      expect(Math.max(contrast(light, accent), contrast(dark, accent))).toBeGreaterThanOrEqual(3);
    }
  });
}

test("forced colours draw the target emphasis as one Highlight outline", async () => {
  await commands.emulateForcedColors("active");
  onTestFinished(() => commands.emulateForcedColors(null));
  const screen = await render(<div className="target-emphasis" style={{ width: 40, height: 20 }} />);
  const mark = screen.container.firstElementChild ?? document.body;
  expect(getComputedStyle(mark).outlineWidth).toBe("4px");
  expect(getComputedStyle(mark).outlineOffset).toBe("0px");
});

test("region and position place the marker and badge, and position overrides a conflicting style", async () => {
  const screen = await render(
    <div className="relative" style={{ width: 200, height: 100 }}>
      <ImageRegionMarker region={{ left: "10%", top: 5, width: "50%", height: 40 }} style={{ left: 0, zIndex: 3 }}>
        <ImageRegionMarkerBadge position={{ left: 12, top: -20 }} style={{ top: 0, zIndex: 4 }} />
      </ImageRegionMarker>
    </div>,
  );
  const marker = screen.container.querySelector<HTMLElement>("[data-slot=image-region-marker]");
  const badge = screen.container.querySelector<HTMLElement>("[data-slot=image-region-marker-badge]");
  expect(getComputedStyle(marker ?? document.body).left).toBe("20px");
  expect(getComputedStyle(marker ?? document.body).width).toBe("100px");
  expect(marker?.style.zIndex).toBe("3");
  expect(getComputedStyle(badge ?? document.body).top).toBe("-20px");
  expect(badge?.style.zIndex).toBe("4");
  expect(getComputedStyle(badge ?? document.body).pointerEvents).toBe("auto");
  expect(badge?.dataset.interactive).toBe("true");
});

test("a badge that is not interactive lets the pointer through", async () => {
  const screen = await render(
    <ImageRegionMarker>
      <ImageRegionMarkerBadge interactive={false} />
    </ImageRegionMarker>,
  );
  const badge = screen.container.querySelector<HTMLElement>("[data-slot=image-region-marker-badge]");
  expect(getComputedStyle(badge ?? document.body).pointerEvents).toBe("none");
  expect(badge?.dataset.interactive).toBe("false");
});

import type { IImageRect } from "../../../image-viewer";

interface IScreenshotOptions {
  width: number;
  height: number;
  /** Fill of the call-to-action button, the only region that differs between the before and after screenshots. */
  buttonFill: string;
}

/** The button rectangle that changes color between the before and after screenshots, in natural pixels. */
export const fixture_changedRegion: IImageRect = { x: 600, y: 360, width: 160, height: 48 };

function rect(x: number, y: number, width: number, height: number, fill: string): string {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
}

/** Builds a deterministic dashboard-like screenshot from axis-aligned rectangles, without fonts or antialiasing. */
function createScreenshot({ width, height, buttonFill }: IScreenshotOptions): string {
  const cards = [0, 1, 2]
    .map((index) => rect(232 + index * 232, 88, 208, 120, "#ffffff") + rect(248 + index * 232, 104, 96, 16, "#94a3b8"))
    .join("");
  const rows = [0, 1, 2, 3]
    .map((index) => rect(232, 240 + index * 40, 344, 24, index % 2 ? "#e2e8f0" : "#cbd5e1"))
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    rect(0, 0, width, height, "#f1f5f9") +
    rect(0, 0, width, 56, "#1e293b") +
    rect(24, 16, 120, 24, "#475569") +
    rect(0, 56, 200, height - 56, "#e2e8f0") +
    rect(24, 88, 152, 20, "#94a3b8") +
    rect(24, 128, 120, 20, "#cbd5e1") +
    cards +
    rows +
    rect(
      fixture_changedRegion.x,
      fixture_changedRegion.y,
      fixture_changedRegion.width,
      fixture_changedRegion.height,
      buttonFill,
    ) +
    "</svg>";
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const fixture_beforeScreenshot: string = createScreenshot({ width: 960, height: 600, buttonFill: "#2563eb" });
export const fixture_afterScreenshot: string = createScreenshot({ width: 960, height: 600, buttonFill: "#dc2626" });
/** A 16:9 capture of the before state, compared against the 16:10 after screenshot. */
export const fixture_widerBeforeScreenshot: string = createScreenshot({
  width: 960,
  height: 540,
  buttonFill: "#2563eb",
});
/** A screenshot larger than typical story frames, for scrolling at original size. */
export const fixture_largeScreenshot: string = createScreenshot({ width: 1600, height: 1000, buttonFill: "#2563eb" });
/** A screenshot smaller than story frames, which fit zoom must not upscale. */
export const fixture_smallScreenshot: string = createScreenshot({ width: 240, height: 150, buttonFill: "#2563eb" });
export const fixture_brokenImage = "data:image/png;base64,AAAA";

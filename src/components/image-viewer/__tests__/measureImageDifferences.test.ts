import { expect, onTestFinished, test, vi } from "vitest";
import { describeImageReadError, getImageReadFailure, measureImageDifferences } from "../measureImageDifferences";
import { createSvgImageUrl, loadCrossOriginImage, loadImage, recordLongTasks, type Rgba } from "./helpers";

const WHITE: Rgba = [255, 255, 255, 255];
const BLUE: Rgba = [37, 99, 235, 255];
const RED: Rgba = [220, 38, 38, 255];
const BUTTON = { x: 600, y: 360, width: 160, height: 48 };

test("measures a changed rectangle at the after image's natural size", async () => {
  const before = await loadImage(createSvgImageUrl(960, 600, WHITE, [{ rect: BUTTON, color: BLUE }]));
  const after = await loadImage(createSvgImageUrl(960, 600, WHITE, [{ rect: BUTTON, color: RED }]));
  const diff = await measureImageDifferences(before, after);
  expect(diff).toMatchObject({ width: 960, height: 600, columns: 60, rows: 38, changedPixels: 160 * 48 });
  expect(diff.regions).toEqual([{ ...BUTTON, changedPixels: 160 * 48 }]);
});

test("draws a differently sized before image contained inside the after image box", async () => {
  const before = await loadImage(createSvgImageUrl(320, 100, WHITE));
  const after = await loadImage(createSvgImageUrl(320, 200, WHITE));
  const diff = await measureImageDifferences(before, after);
  expect(diff.regions).toEqual([
    { x: 0, y: 0, width: 320, height: 50, changedPixels: 320 * 50 },
    { x: 0, y: 150, width: 320, height: 50, changedPixels: 320 * 50 },
  ]);
});

test("compares 2560×1440 screenshots in slices without long main-thread tasks", async () => {
  const change = { x: 1800, y: 1100, width: 320, height: 120 };
  const before = await loadImage(createSvgImageUrl(2560, 1440, WHITE, [{ rect: change, color: BLUE }]));
  const after = await loadImage(createSvgImageUrl(2560, 1440, WHITE, [{ rect: change, color: RED }]));
  let yields = 0;
  const [diff, longTasks] = await recordLongTasks(() =>
    measureImageDifferences(before, after, {
      yieldToMain: async () => {
        yields++;
        await new Promise((resolve) => setTimeout(resolve, 0));
      },
    }),
  );
  expect(diff.regions).toEqual([{ ...change, changedPixels: change.width * change.height }]);
  expect(yields).toBeGreaterThan(4);
  expect(longTasks).toEqual([]);
});

test("a zero slice budget yields after every band of rows", async () => {
  const image = await loadImage(createSvgImageUrl(64, 100, WHITE));
  let yields = 0;
  const diff = await measureImageDifferences(image, image, {
    sliceBudget: 0,
    now: () => 0,
    yieldToMain: async () => {
      yields++;
    },
  });
  expect(diff.regions).toEqual([]);
  // Two yields follow the canvas draws; the 100 rows form four 32-row bands.
  expect(yields).toBe(6);
});

test("aborting cancels the comparison between slices", async () => {
  const image = await loadImage(createSvgImageUrl(64, 100, WHITE));
  const controller = new AbortController();
  const comparison = measureImageDifferences(image, image, {
    signal: controller.signal,
    yieldToMain: async () => controller.abort(),
  });
  await expect(comparison).rejects.toThrow(expect.objectContaining({ name: "AbortError" }));
  const reason = await comparison.catch((error: unknown) => describeImageReadError(error));
  expect(reason).toBeUndefined();
});

test("pixels of images that cannot be decoded are unavailable", async () => {
  const broken = new Image();
  broken.src = "data:image/png;base64,AAAA";
  expect(await getImageReadFailure(broken)).toBe("Pixels cannot be read: an image could not be decoded.");
  const readable = await loadImage(createSvgImageUrl(4, 4, WHITE));
  expect(await getImageReadFailure(readable)).toBeUndefined();
  await expect(measureImageDifferences(broken, readable)).rejects.toThrow(
    expect.objectContaining({ name: "EncodingError" }),
  );
});

test("pixels of cross-origin images without CORS access are unavailable", async () => {
  const image = await loadCrossOriginImage("/src/components/stories/fixtures/avatar.svg");
  expect(new URL(image.src).origin).not.toBe(location.origin);
  expect(await getImageReadFailure(image)).toBe(
    "Pixels cannot be read: an image comes from another origin without CORS access.",
  );
  const readable = await loadImage(createSvgImageUrl(4, 4, WHITE));
  const error = await measureImageDifferences(image, readable).catch((failure: unknown) => failure);
  expect(describeImageReadError(error)).toBe(
    "Pixels cannot be read: an image comes from another origin without CORS access.",
  );
});

test("other failures are described generically", () => {
  expect(describeImageReadError(new Error("Canvas 2D drawing is unavailable."))).toBe(
    "Pixels cannot be read in this browser.",
  );
  expect(describeImageReadError(new DOMException("Denied", "NotAllowedError"))).toBe(
    "Pixels cannot be read in this browser.",
  );
});

test("browsers without scheduler.yield yield through macrotasks", async () => {
  vi.stubGlobal("scheduler", undefined);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  const before = await loadImage(
    createSvgImageUrl(64, 100, WHITE, [{ rect: { x: 8, y: 40, width: 16, height: 16 }, color: BLUE }]),
  );
  const after = await loadImage(
    createSvgImageUrl(64, 100, WHITE, [{ rect: { x: 8, y: 40, width: 16, height: 16 }, color: RED }]),
  );
  const diff = await measureImageDifferences(before, after, { sliceBudget: 0 });
  expect(diff.regions).toEqual([{ x: 8, y: 40, width: 16, height: 16, changedPixels: 256 }]);
});

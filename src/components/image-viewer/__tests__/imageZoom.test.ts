import { expect, test } from "vitest";
import {
  MAX_IMAGE_ZOOM,
  clampImageZoomScale,
  formatImageZoom,
  getImageZoomScales,
  getNextImageZoom,
  getOpeningImageZoom,
  getPreviousImageZoom,
  resolveImageZoomScale,
} from "../imageZoom";

const wideStage = { width: 1400, height: 760 };

test("fit never upscales while fit width fills the stage's width up to 400%", () => {
  expect(getImageZoomScales({ width: 800, height: 1200 }, wideStage)).toEqual({ fit: 760 / 1200, fitWidth: 1.75 });
  expect(getImageZoomScales({ width: 200, height: 100 }, wideStage)).toEqual({ fit: 1, fitWidth: MAX_IMAGE_ZOOM });
  expect(getImageZoomScales({ width: 0, height: 100 }, wideStage)).toEqual({ fit: 1, fitWidth: 1 });
});

test("numeric zooms clamp between the fitted scale and 400%", () => {
  const scales = { fit: 0.5, fitWidth: 0.8 };
  expect(resolveImageZoomScale("fit", scales)).toBe(0.5);
  expect(resolveImageZoomScale("fit-width", scales)).toBe(0.8);
  expect(resolveImageZoomScale(2, scales)).toBe(2);
  expect(resolveImageZoomScale(0.1, scales)).toBe(0.5);
  expect(resolveImageZoomScale(7, scales)).toBe(MAX_IMAGE_ZOOM);
  expect(clampImageZoomScale(0.2, scales)).toBe(0.5);
  expect(clampImageZoomScale(5, scales)).toBe(MAX_IMAGE_ZOOM);
});

test("zoom in steps up to 400% and stops there", () => {
  const steps: number[] = [];
  let scale = 0.22;
  while (scale < MAX_IMAGE_ZOOM) {
    const next = getNextImageZoom(scale);
    steps.push(next);
    scale = next;
  }
  expect(steps).toEqual([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]);
  expect(getNextImageZoom(MAX_IMAGE_ZOOM)).toBe(MAX_IMAGE_ZOOM);
  expect(getNextImageZoom(1.1)).toBe(1.25);
});

test("zoom out steps down to fit and no further", () => {
  const scales = { fit: 0.6, fitWidth: 1 };
  expect(getPreviousImageZoom(4, scales)).toBe(3);
  expect(getPreviousImageZoom(1, scales)).toBe(0.75);
  expect(getPreviousImageZoom(0.75, scales)).toBe("fit");
  expect(getPreviousImageZoom(0.6, scales)).toBe("fit");
  expect(getPreviousImageZoom(0.25, { fit: 0.1, fitWidth: 0.2 })).toBe("fit");
});

test("a tall image opens at fit width and a wide one at fit", () => {
  expect(getOpeningImageZoom({ width: 800, height: 1200 }, wideStage)).toBe("fit-width");
  expect(getOpeningImageZoom({ width: 1600, height: 900 }, { width: 1400, height: 800 })).toBe("fit");
  expect(getOpeningImageZoom({ width: 240, height: 150 }, wideStage)).toBe("fit");
});

test("the opening zoom is never narrower than the image was on the page", () => {
  const phoneStage = { width: 356, height: 640 };
  expect(getOpeningImageZoom({ width: 1600, height: 900 }, phoneStage, 342)).toBe("fit");
  expect(getOpeningImageZoom({ width: 1600, height: 900 }, { width: 600, height: 1000 }, 800)).toBe(0.5);
  expect(getOpeningImageZoom({ width: 100, height: 100 }, { width: 1000, height: 1000 }, 1000)).toBe(MAX_IMAGE_ZOOM);
  expect(getOpeningImageZoom({ width: 0, height: 0 }, phoneStage, 300)).toBe("fit");
});

test("zoom formats as a whole percent", () => {
  expect(formatImageZoom(1.5)).toBe("150%");
  expect(formatImageZoom(0.2225)).toBe("22%");
});

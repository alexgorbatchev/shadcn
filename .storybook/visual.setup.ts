import { afterEach, expect } from "vitest";
import { page } from "vitest/browser";

afterEach(async ({ task }) => {
  await document.fonts.ready;
  for (const width of [1280, 390]) {
    await page.viewport(width, 900);
    await expect(page.elementLocator(document.body)).toMatchScreenshot(
      `${task.file.projectName}-${task.name}-${width}`,
    );
  }
});

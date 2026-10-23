import type { BrowserCommand } from "vitest/node";

/** Move a mouse scrub one rendered frame at a time; callers select the pointer-lock environment. */
export const nativeScrub: BrowserCommand<[selector: string, deltaX: number]> = async (
  context,
  selector,
  deltaX,
): Promise<void> => {
  const element = context.iframe.locator(selector);
  await element.scrollIntoViewIfNeeded();
  const bounds = await element.boundingBox();
  if (!bounds) throw new Error(`Cannot scrub an element without visible bounds: ${selector}`);
  const startX = bounds.x + bounds.width / 2;
  const startY = bounds.y + bounds.height / 2;
  await context.page.mouse.move(startX, startY);
  await context.page.mouse.down();
  try {
    for (let step = 1; step <= 10; step++) {
      await context.page.mouse.move(startX + (deltaX * step) / 10, startY);
      await context.iframe
        .locator("body")
        .evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    }
  } finally {
    await context.page.mouse.up();
  }
};

declare module "vitest/browser" {
  interface BrowserCommands {
    nativeScrub: (selector: string, deltaX: number) => Promise<void>;
  }
}

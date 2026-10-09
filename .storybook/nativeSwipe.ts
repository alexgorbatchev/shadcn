import type { BrowserCommand } from "vitest/node";

export const nativeSwipe: BrowserCommand<[selector: string, deltaX: number, deltaY: number]> = async (
  context,
  selector,
  deltaX,
  deltaY,
): Promise<void> => {
  const element = context.iframe.locator(selector);
  await element.scrollIntoViewIfNeeded();
  const bounds = await element.boundingBox();
  if (!bounds) throw new Error(`Cannot swipe an element without visible bounds: ${selector}`);
  const startX = bounds.x + bounds.width / 2;
  const startY = bounds.y + bounds.height / 2;
  await context.page.mouse.move(startX, startY);
  await context.page.mouse.down();
  try {
    await context.page.mouse.move(startX + 1, startY + 1);
    await context.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 });
  } finally {
    await context.page.mouse.up();
  }
};

declare module "vitest/browser" {
  interface BrowserCommands {
    nativeSwipe: (selector: string, deltaX: number, deltaY: number) => Promise<void>;
  }
}

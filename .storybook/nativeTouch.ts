import type { BrowserCommand } from "vitest/node";

/**
 * Plays real touch input through the Chrome DevTools Protocol: every finger starts at the first offset of its path,
 * moves through the rest in step, then lifts. Offsets are CSS pixels of the element. Paths must have the same length.
 */
export const nativeTouch: BrowserCommand<[selector: string, paths: { x: number; y: number }[][]]> = async (
  context,
  selector,
  paths,
): Promise<void> => {
  const element = context.iframe.locator(selector);
  await element.scrollIntoViewIfNeeded();
  const bounds = await element.boundingBox();
  if (!bounds) throw new Error(`Cannot touch an element without visible bounds: ${selector}`);
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  // The test page may be scaled inside its frame; offsets are CSS pixels of the element.
  const cssWidth = await element.evaluate((node) => node.getBoundingClientRect().width);
  const ratio = cssWidth > 0 ? bounds.width / cssWidth : 1;
  const steps = paths[0]?.length ?? 0;
  if (steps === 0 || paths.some((path) => path.length !== steps)) throw new Error("Touch paths need equal lengths");
  const session = await context.page.context().newCDPSession(context.page);
  const touchPoints = (step: number): { x: number; y: number; id: number }[] =>
    paths.map((path, id) => ({ x: centerX + path[step]!.x * ratio, y: centerY + path[step]!.y * ratio, id }));
  try {
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touchPoints(0) });
    for (let step = 1; step < steps; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touchPoints(step) });
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } finally {
    await session.detach();
  }
};

declare module "vitest/browser" {
  interface BrowserCommands {
    nativeTouch: (selector: string, paths: { x: number; y: number }[][]) => Promise<void>;
  }
}

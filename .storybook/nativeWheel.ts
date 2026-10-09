import type { BrowserCommand } from "vitest/node";

export const nativeWheel: BrowserCommand<[selector: string, deltaY: number]> = async (
  context,
  selector,
  deltaY,
): Promise<void> => {
  const element = context.iframe.locator(selector);
  await element.hover();
  await context.page.mouse.wheel(0, deltaY);
};

declare module "vitest/browser" {
  interface BrowserCommands {
    nativeWheel: (selector: string, deltaY: number) => Promise<void>;
  }
}

import type { BrowserCommand } from "vitest/node";

type Contrast = "more" | "no-preference" | null;

// Emulation is page-wide; each Vitest browser session owns its page, so tests reset it with `null` when they finish.
export const emulateContrast: BrowserCommand<[contrast: Contrast]> = async (context, contrast): Promise<void> => {
  await context.page.emulateMedia({ contrast });
};

declare module "vitest/browser" {
  interface BrowserCommands {
    emulateContrast: (contrast: Contrast) => Promise<void>;
  }
}

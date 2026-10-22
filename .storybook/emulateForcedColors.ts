import type { BrowserCommand } from "vitest/node";

type ForcedColors = "active" | "none" | null;

// Emulation is page-wide; each Vitest browser session owns its page, so tests reset it with `null` when they finish.
export const emulateForcedColors: BrowserCommand<[forcedColors: ForcedColors]> = async (
  context,
  forcedColors,
): Promise<void> => {
  await context.page.emulateMedia({ forcedColors });
};

declare module "vitest/browser" {
  interface BrowserCommands {
    emulateForcedColors: (forcedColors: ForcedColors) => Promise<void>;
  }
}

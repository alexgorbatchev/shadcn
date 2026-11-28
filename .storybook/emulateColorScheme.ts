import type { BrowserCommand } from "vitest/node";

type ColorScheme = "light" | "dark" | "no-preference" | null;

// Emulation is page-wide; each Vitest browser session owns its page, so tests reset it with `null` when they finish.
export const emulateColorScheme: BrowserCommand<[colorScheme: ColorScheme]> = async (
  context,
  colorScheme,
): Promise<void> => {
  await context.page.emulateMedia({ colorScheme });
};

declare module "vitest/browser" {
  interface BrowserCommands {
    emulateColorScheme: (colorScheme: ColorScheme) => Promise<void>;
  }
}

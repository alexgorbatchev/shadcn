import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import config from "./vitest.config.ts";

export default defineConfig(
  mergeConfig(config, {
    cacheDir: ".cache/storybook/tests-reduced-motion",
    test: {
      browser: {
        provider: playwright({
          contextOptions: { reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] },
        }),
      },
    },
  }),
);

import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vite";
import config from "./vitest.config.ts";

export default defineConfig({
  ...config,
  cacheDir: ".cache/storybook/tests-contrast",
  plugins: [],
  test: {
    ...config.test,
    attachmentsDir: ".tmp/contrast-attachments",
    browser: {
      ...config.test?.browser,
      screenshotDirectory: ".tmp/contrast-screenshots",
      provider: playwright({
        contextOptions: { reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] },
      }),
    },
    projects: ["light", "dark"].flatMap((theme, themeIndex) =>
      ["comfortable", "compact"].map((density, densityIndex) => {
        const cacheDir = `.cache/storybook/tests-contrast/${theme}-${density}`;
        const cachePlugin: Plugin = {
          name: "vite-plugin-contrast-cache",
          enforce: "post",
          // Storybook's viteFinal sets its own cache; keep each matrix configuration isolated.
          config: () => ({ cacheDir }),
        };
        return {
          extends: true,
          plugins: [
            storybookTest({ configDir: `${process.cwd()}/.storybook`, initialGlobals: { theme, density } }),
            cachePlugin,
          ],
          test: {
            name: `contrast-${theme}-${density}`,
            fileParallelism: false,
            // Native clipboard contents are shared across Chromium contexts and projects.
            sequence: { groupOrder: themeIndex * 2 + densityIndex },
          },
        };
      }),
    ),
  },
});

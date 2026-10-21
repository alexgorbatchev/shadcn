import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vite";
import config from "./vitest.config.ts";

export default defineConfig({
  ...config,
  cacheDir: ".cache/storybook/tests-visual",
  plugins: [],
  test: {
    ...config.test,
    attachmentsDir: ".tmp/visual-attachments",
    setupFiles: ["./.storybook/visual.setup.ts"],
    browser: {
      ...config.test?.browser,
      provider: playwright({
        contextOptions: { reducedMotion: "reduce", deviceScaleFactor: 1 },
        // Playwright otherwise hides the native scrollbars these screenshots verify.
        launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] },
      }),
      expect: { toMatchScreenshot: { comparatorOptions: { allowedMismatchedPixels: 0 } } },
    },
    projects: ["light", "dark"].flatMap((theme, themeIndex) =>
      ["comfortable", "compact"].map((density, densityIndex) => {
        const cacheDir = `.cache/storybook/tests-visual/${theme}-${density}`;
        const cachePlugin: Plugin = {
          name: "vite-plugin-visual-cache",
          enforce: "post",
          config: () => ({ cacheDir }),
        };
        return {
          extends: true,
          plugins: [
            storybookTest({
              configDir: `${process.cwd()}/.storybook`,
              initialGlobals: { theme, density },
              tags: { include: ["visual"] },
            }),
            cachePlugin,
          ],
          test: {
            name: `visual-${theme}-${density}`,
            fileParallelism: false,
            sequence: { groupOrder: themeIndex * 2 + densityIndex },
          },
        };
      }),
    ),
  },
});

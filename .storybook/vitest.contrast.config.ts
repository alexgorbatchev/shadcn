import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vite";
import config from "./vitest.config.ts";

// Storybook's viteFinal sets its own cache; keep each project's optimized dependencies isolated.
function createContrastCachePlugin(name: string): Plugin {
  return {
    name: "vite-plugin-contrast-cache",
    enforce: "post",
    config: () => ({ cacheDir: `.cache/storybook/tests-contrast/${name}` }),
  };
}

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
    // Mirrors the Storybook config: stories run in parallel pages, and the clipboard stories run alone afterwards because
    // native clipboard contents are shared across Chromium contexts. A single page accumulates renderer memory across
    // files, so running the whole catalog through one page exhausts it.
    projects: ["light", "dark"].flatMap((theme, themeIndex) =>
      ["comfortable", "compact"].flatMap((density, densityIndex) => {
        const matrixIndex = themeIndex * 2 + densityIndex;
        const createStorybookPlugin = () =>
          storybookTest({ configDir: `${process.cwd()}/.storybook`, initialGlobals: { theme, density } });
        return [
          {
            extends: true,
            plugins: [createStorybookPlugin(), createContrastCachePlugin(`${theme}-${density}`)],
            test: {
              name: `contrast-${theme}-${density}`,
              exclude: ["src/**/__tests__/**", "src/components/stories/**/{InputGroup,Table}.stories.tsx"],
              sequence: { groupOrder: matrixIndex * 2 },
            },
          },
          {
            extends: true,
            plugins: [createStorybookPlugin(), createContrastCachePlugin(`${theme}-${density}-clipboard`)],
            test: {
              name: `contrast-${theme}-${density}-clipboard`,
              exclude: [
                "src/**/__tests__/**",
                "src/components/stories/**/!(InputGroup|Table).stories.tsx",
                "src/components/stories/assistant-ui/**",
              ],
              fileParallelism: false,
              sequence: { groupOrder: matrixIndex * 2 + 1 },
            },
          },
        ];
      }),
    ),
  },
});

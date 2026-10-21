import { defineConfig } from "vitest/config";
import storybookConfig from "./vitest.config.js";

export default defineConfig({
  ...storybookConfig,
  test: {
    ...storybookConfig.test,
    coverage: { ...storybookConfig.test?.coverage, provider: "istanbul", reportOnFailure: true },
    projects: [
      ...(storybookConfig.test?.projects ?? []),
      {
        extends: ".storybook/vitest.native.config.ts",
        root: ".",
        test: { name: "native-browser-coverage", sequence: { groupOrder: 2 } },
      },
    ],
  },
});

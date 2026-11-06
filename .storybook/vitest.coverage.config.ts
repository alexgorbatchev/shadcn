import { configDefaults, defineConfig } from "vitest/config";
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
        test: {
          name: "native-browser-coverage",
          // DragDrop already runs in drag-drop-native.
          exclude: [...configDefaults.exclude, "src/components/__tests__/DragDrop.test.tsx"],
          sequence: { groupOrder: 2 },
        },
      },
    ],
  },
});

import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { emulateForcedColors } from "./emulateForcedColors.ts";
import { nativeSwipe } from "./nativeSwipe.ts";
import { nativeWheel } from "./nativeWheel.ts";
import { beginResourceRequests, endResourceRequests } from "./nativeResourceRequests.js";

export default defineConfig({
  cacheDir: ".cache/storybook/native-tests",
  optimizeDeps: {
    include: [
      "@assistant-ui/react-markdown",
      "remark-gfm",
      "colorjs.io",
      "diff",
      "parse-diff",
      "anser",
      "strip-ansi",
      "@assistant-ui/react",
      "@assistant-ui/store",
      "@testing-library/react",
      "@base-ui/react/dialog",
      "@base-ui/react/drawer",
      "@base-ui/react/toast",
      "sonner",
      "@storybook/react-vite",
      "react-dom/client",
      "react-dom/server",
      "@base-ui/react/button",
      "@base-ui/react/use-render",
      "@base-ui/react/merge-props",
    ],
  },
  plugins: [react(), tailwindcss()],
  test: {
    name: "native-browser",
    attachmentsDir: ".tmp/native-browser-attachments",
    include: [
      "src/components/__tests__/*.test.tsx",
      "src/components/assistant-ui/hooks/__tests__/*.test.ts",
      "src/components/assistant-ui/hooks/__tests__/*.test.tsx",
      "src/components/assistant-ui/utils/__tests__/*.test.ts",
      "src/components/assistant-ui/native/__tests__/*.test.ts",
      ".storybook/__tests__/*.test.tsx",
    ],
    browser: {
      enabled: true,
      headless: true,
      screenshotDirectory: ".tmp/native-browser-screenshots",
      commands: { emulateForcedColors, nativeSwipe, nativeWheel, beginResourceRequests, endResourceRequests },
      provider: playwright(),
      instances: [
        { browser: "chromium", exclude: ["src/components/__tests__/Carousel.test.tsx"] },
        {
          browser: "chromium",
          name: "native-reduced-motion",
          include: ["src/components/__tests__/Carousel.test.tsx"],
          provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
        },
        { browser: "webkit", include: ["src/components/__tests__/Drawer.test.tsx"] },
      ],
    },
  },
});

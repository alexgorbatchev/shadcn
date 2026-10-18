import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nativeSwipe } from "./nativeSwipe.ts";
import { nativeWheel } from "./nativeWheel.ts";

export default defineConfig({
  cacheDir: ".cache/storybook/native-tests",
  optimizeDeps: {
    include: [
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
    include: ["src/components/__tests__/*.test.tsx", ".storybook/__tests__/*.test.tsx"],
    browser: {
      enabled: true,
      headless: true,
      screenshotDirectory: ".tmp/native-browser-screenshots",
      commands: { nativeSwipe, nativeWheel },
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

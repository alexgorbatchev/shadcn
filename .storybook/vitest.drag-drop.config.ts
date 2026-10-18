import { defineProject } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineProject({
  root: process.cwd(),
  cacheDir: ".cache/storybook/drag-drop-tests",
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      "react-dom/client",
      "react-dom/server",
      "@base-ui/react/button",
      "@base-ui/react/use-render",
      "@base-ui/react/merge-props",
    ],
  },
  test: {
    attachmentsDir: ".tmp/drag-drop-attachments",
    name: "drag-drop-native",
    include: ["src/components/__tests__/DragDrop.test.tsx"],
    browser: {
      enabled: true,
      headless: true,
      screenshotDirectory: ".tmp/drag-drop-screenshots",
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});

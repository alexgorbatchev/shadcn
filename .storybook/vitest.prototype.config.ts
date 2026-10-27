import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { prototypeSourceAliases } from "./prototypeSourceAliases.ts";

export default defineConfig({
  cacheDir: ".cache/prototype-tests",
  resolve: { alias: prototypeSourceAliases },
  plugins: [react(), tailwindcss()],
  test: {
    include: [".storybook/__tests__/PrototypeWorkbench.test.tsx"],
    browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: "chromium" }] },
    coverage: {
      provider: "istanbul",
      include: ["templates/prototype/src/**/*.{ts,tsx}"],
      exclude: ["templates/prototype/src/types.ts"],
      reportsDirectory: ".tmp/prototype-coverage",
      reporter: ["text", "json-summary"],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
});

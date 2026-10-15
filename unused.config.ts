import { defineConfig } from "ts-unused";

export default defineConfig({
  packageMode: true,
  testFilePatterns: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/__tests__/**",
    "**/*.stories.tsx",
  ],
});

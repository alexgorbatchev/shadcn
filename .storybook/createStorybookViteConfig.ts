import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { mergeConfig, type UserConfig } from "vite";
import { STORYBOOK_BUNDLE_BUDGET } from "./constants.ts";
import { createPreviewAssetBasePlugin } from "./plugins/createPreviewAssetBasePlugin.ts";
import { createStorybookBundleBudgetPlugin } from "./plugins/createStorybookBundleBudgetPlugin.ts";

interface IStorybookViteOptions {
  configType?: "DEVELOPMENT" | "PRODUCTION";
  rootDirectory: string;
  allowedHosts: string[];
  port?: number;
}

export function createStorybookViteConfig(viteConfig: UserConfig, options: IStorybookViteOptions): UserConfig {
  const isDevelopmentPreview = options.configType === "DEVELOPMENT" && typeof options.port === "number";
  const developmentAssetBase = `/__storybook/${options.port}/`;
  return mergeConfig(viteConfig, {
    cacheDir: `${options.rootDirectory}/.cache/storybook/${isDevelopmentPreview ? `dev-${options.port}` : options.configType === "PRODUCTION" ? "build" : "tests"}`,
    base: isDevelopmentPreview ? developmentAssetBase : viteConfig.base,
    plugins: [
      react(),
      tailwindcss(),
      createStorybookBundleBudgetPlugin(),
      ...(isDevelopmentPreview ? [createPreviewAssetBasePlugin(developmentAssetBase)] : []),
    ],
    build: { chunkSizeWarningLimit: STORYBOOK_BUNDLE_BUDGET.maxRawBytes / 1000 },
    server: { allowedHosts: options.allowedHosts, headers: { "Cache-Control": "no-store" }, hmr: false },
    resolve: { alias: { "@": `${options.rootDirectory}/src` } },
  });
}

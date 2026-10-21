import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";
import { createPreviewAssetBasePlugin } from "./plugins/createPreviewAssetBasePlugin.ts";

const storybookAllowedHosts = (process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const config: StorybookConfig = {
  stories: ["../src/components/stories/**/*.stories.tsx", "./*.mdx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true, allowedHosts: storybookAllowedHosts },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      include: ["src/components/**/*.tsx"],
      exclude: ["**/stories/**"],
    },
  },
  async viteFinal(viteConfig, options) {
    const isDevelopmentPreview = options.configType === "DEVELOPMENT" && typeof options.port === "number";
    const developmentAssetBase = `/__storybook/${options.port}/`;
    return mergeConfig(viteConfig, {
      cacheDir: `${import.meta.dir}/../.cache/storybook/${isDevelopmentPreview ? `dev-${options.port}` : options.configType === "PRODUCTION" ? "build" : "tests"}`,
      base: isDevelopmentPreview ? developmentAssetBase : viteConfig.base,
      plugins: [tailwindcss(), ...(isDevelopmentPreview ? [createPreviewAssetBasePlugin(developmentAssetBase)] : [])],
      server: { allowedHosts: storybookAllowedHosts, headers: { "Cache-Control": "no-store" }, hmr: false },
      resolve: { alias: { "@": `${import.meta.dir}/../src` } },
    });
  },
};

export default config;

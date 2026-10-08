import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";
import { createPreviewAssetBasePlugin } from "./plugins/createPreviewAssetBasePlugin";

const storybookAllowedHosts = (process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const config: StorybookConfig = {
  stories: ["../src/components/stories/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
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
    const developmentAssetBase = `/__storybook/${options.port}/`;
    return mergeConfig(viteConfig, {
      cacheDir: `${import.meta.dir}/../.cache/storybook/${options.configType === "DEVELOPMENT" ? `dev-${options.port}` : "build"}`,
      base: options.configType === "DEVELOPMENT" ? developmentAssetBase : viteConfig.base,
      plugins: [tailwindcss(), createPreviewAssetBasePlugin(developmentAssetBase)],
      server: { allowedHosts: storybookAllowedHosts, headers: { "Cache-Control": "no-store" } },
      resolve: { alias: { "@": `${import.meta.dir}/../src` } },
    });
  },
};

export default config;

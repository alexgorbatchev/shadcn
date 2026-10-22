import type { StorybookConfig } from "@storybook/react-vite";
import { createStorybookViteConfig } from "./createStorybookViteConfig.ts";

const storybookAllowedHosts = (process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const config: StorybookConfig = {
  stories: ["../src/components/stories/**/!(__screenshots__)/*.stories.tsx", "./*.mdx"],
  staticDirs: [
    { from: "../.tmp/llm-docs-public", to: "/" },
    { from: "../llms", to: "/llms" },
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true, allowedHosts: storybookAllowedHosts },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      include: ["src/components/**/*.tsx"],
      exclude: ["**/stories/**"],
      fileSystemCache: { directory: ".cache/storybook/docgen" },
    },
  },
  async viteFinal(viteConfig, options) {
    return createStorybookViteConfig(viteConfig, {
      configType: options.configType,
      port: options.port,
      rootDirectory: `${import.meta.dirname}/..`,
      allowedHosts: storybookAllowedHosts,
    });
  },
};

export default config;

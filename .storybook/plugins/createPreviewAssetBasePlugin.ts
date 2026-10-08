import type { Plugin } from "vite";

export function createPreviewAssetBasePlugin(assetBase: string): Plugin {
  return {
    name: "vite-plugin-storybook-preview-asset-base",
    apply: "serve",
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        if (context.path !== "/iframe.html") return html;

        // Storybook's bootstrap script stays root-relative after Vite's base transform.
        return html
          .replace('src="/@id/', `src="${assetBase}@id/`)
          .replace('src="/vite-inject-mocker-entry.js"', `src="${assetBase}vite-inject-mocker-entry.js"`);
      },
    },
  };
}

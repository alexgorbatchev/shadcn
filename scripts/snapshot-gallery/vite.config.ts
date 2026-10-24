import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  cacheDir: `../../.cache/snapshot-gallery/${process.env.PORT ?? "local"}`,
  server: {
    host: "127.0.0.1",
    strictPort: true,
    fs: { allow: [`${import.meta.dirname}/../..`] },
    headers: { "Cache-Control": "no-store" },
  },
  build: { outDir: "../../.tmp/snapshot-gallery", emptyOutDir: true },
});

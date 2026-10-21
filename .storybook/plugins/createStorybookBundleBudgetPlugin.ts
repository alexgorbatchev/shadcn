import { gzipSync } from "node:zlib";
import type { Plugin } from "vite";
import { STORYBOOK_BUNDLE_BUDGET } from "../constants.ts";

export function createStorybookBundleBudgetPlugin(): Plugin {
  return {
    name: "storybook:bundle-budget",
    apply: "build",
    generateBundle(_options, bundle) {
      let largestRawBytes = 0;
      let largestEntryGzipBytes = 0;
      let largestChunkGzipBytes = 0;
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        const rawBytes = Buffer.byteLength(chunk.code);
        const gzipBytes = gzipSync(chunk.code).byteLength;
        const maxGzipBytes = chunk.isEntry
          ? STORYBOOK_BUNDLE_BUDGET.maxEntryGzipBytes
          : STORYBOOK_BUNDLE_BUDGET.maxChunkGzipBytes;
        if (rawBytes > STORYBOOK_BUNDLE_BUDGET.maxRawBytes || gzipBytes > maxGzipBytes) {
          this.error({
            code: "STORYBOOK_BUNDLE_BUDGET",
            message: `${chunk.fileName} exceeds the Storybook JavaScript budget: ${rawBytes}/${STORYBOOK_BUNDLE_BUDGET.maxRawBytes} raw bytes, ${gzipBytes}/${maxGzipBytes} gzip bytes.`,
          });
        }
        largestRawBytes = Math.max(largestRawBytes, rawBytes);
        if (chunk.isEntry) largestEntryGzipBytes = Math.max(largestEntryGzipBytes, gzipBytes);
        else largestChunkGzipBytes = Math.max(largestChunkGzipBytes, gzipBytes);
      }
      this.info(
        `Storybook JavaScript budgets passed: largest raw chunk ${largestRawBytes} bytes; largest entry gzip ${largestEntryGzipBytes} bytes; largest shared/lazy gzip ${largestChunkGzipBytes} bytes.`,
      );
    },
  };
}

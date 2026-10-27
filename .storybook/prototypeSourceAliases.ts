import { fileURLToPath } from "node:url";
import type { Alias } from "vite";

export const prototypeSourceAliases: Alias[] = [
  { find: /^@alexgorbatchev\/shadcn$/, replacement: fileURLToPath(new URL("../src/index.ts", import.meta.url)) },
  {
    find: /^@alexgorbatchev\/shadcn\/theme\.css$/,
    replacement: fileURLToPath(new URL("../src/theme.css", import.meta.url)),
  },
];

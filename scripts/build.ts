import { mkdir, rm } from "node:fs/promises";
import ts from "typescript";
import manifest from "../package.json";
import config from "../tsconfig.json";
import { buildLlmDocs } from "./buildLlmDocs";

const entrypoints = await Promise.all(
  Object.values(manifest.exports)
    .filter((entry) => typeof entry !== "string")
    .map(async (entry) => {
      const sourcePath = entry.import.replace("./dist/", "src/").replace(/\.js$/, ".ts");
      return (await Bun.file(sourcePath).exists()) ? sourcePath : sourcePath.replace(/\.ts$/, ".tsx");
    }),
);

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
const result = await Bun.build({
  entrypoints,
  root: "src",
  outdir: "dist",
  splitting: true,
  target: "browser",
  format: "esm",
  jsx: { development: false },
  // The consuming application decides whether library diagnostics run.
  define: { "process.env.NODE_ENV": "process.env.NODE_ENV" },
  packages: "bundle",
  external: [
    ...Object.keys(manifest.dependencies).filter((name) => !["@shadcn/react", "sonner", "input-otp"].includes(name)),
    ...Object.keys(manifest.peerDependencies),
  ],
  minify: false,
});
if (!result.success) {
  throw new AggregateError(result.logs, "Library build failed");
}
const parsed = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd(), {
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: false,
  noEmitOnError: true,
  declaration: true,
  emitDeclarationOnly: true,
  allowImportingTsExtensions: false,
  outDir: "dist",
  rootDir: "src",
});
const program = ts.createProgram(
  [...entrypoints, ...parsed.fileNames.filter((fileName) => fileName.endsWith(".d.ts"))],
  parsed.options,
);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program), ...program.emit().diagnostics];
if (diagnostics.length > 0) {
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getCanonicalFileName: (name) => name,
      getNewLine: () => ts.sys.newLine,
    }),
  );
}
await Promise.all([
  Bun.write("dist/theme.css", Bun.file("src/theme.css")),
  Bun.write("dist/typeset.css", Bun.file("src/typeset.css")),
  Bun.write("dist/fonts.css", Bun.file("src/fonts.css")),
  Bun.write("dist/assistant-ui.css", Bun.file("src/components/assistant-ui/assistant-ui.css")),
  Bun.write("dist/generative-ui.css", Bun.file("src/components/assistant-ui/generative-ui.css")),
  Bun.write("dist/assistant-ui/markdown.css", Bun.file("src/components/assistant-ui/markdown.css")),
  Bun.write("dist/assistant-ui/geo-map.css", Bun.file("src/components/assistant-ui/geo-map.css")),
]);
await buildLlmDocs(process.cwd());
console.log(
  `Built ${result.outputs.length} JavaScript asset(s), exported theme/font stylesheets, and LLM documentation.`,
);

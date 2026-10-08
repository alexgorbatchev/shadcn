import { mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
const result = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "browser",
  format: "esm",
  packages: "external",
  minify: false,
});
if (!result.success) {
  throw new AggregateError(result.logs, "Library build failed");
}
await Promise.all([
  Bun.write("dist/theme.css", Bun.file("src/theme.css")),
  Bun.write("dist/fonts.css", Bun.file("src/fonts.css")),
]);
console.log(`Built ${result.outputs.length} JavaScript asset(s) and exported theme/font stylesheets.`);

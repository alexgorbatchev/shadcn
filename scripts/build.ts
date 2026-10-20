import { mkdir, rm } from "node:fs/promises";
import manifest from "../package.json";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
const result = await Bun.build({
  entrypoints: Object.values(manifest.exports)
    .filter((entry) => typeof entry !== "string")
    .map((entry) => entry.import.replace("./dist/", "src/").replace(/\.js$/, ".ts")),
  root: "src",
  outdir: "dist",
  splitting: true,
  target: "browser",
  format: "esm",
  jsx: { development: false },
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
await Promise.all([
  Bun.write("dist/theme.css", Bun.file("src/theme.css")),
  Bun.write("dist/typeset.css", Bun.file("src/typeset.css")),
  Bun.write("dist/fonts.css", Bun.file("src/fonts.css")),
]);
console.log(`Built ${result.outputs.length} JavaScript asset(s) and exported theme/font stylesheets.`);

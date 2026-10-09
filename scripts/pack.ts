import { mkdir, rm } from "node:fs/promises";
import manifest from "../package.json";

const stagingPath = ".tmp/package";
const destinationPath = `${process.cwd()}/.tmp/packs`;
await rm(stagingPath, { recursive: true, force: true });
await mkdir(stagingPath, { recursive: true });
await mkdir(destinationPath, { recursive: true });
const consumerManifest = Object.fromEntries(
  Object.entries(manifest).filter(([name]) => !["devDependencies", "scripts", "patchedDependencies"].includes(name)),
);
await Bun.write(`${stagingPath}/package.json`, JSON.stringify(consumerManifest, null, 2));
for (const pattern of ["dist/**/*", "patches/**/*", "LICENSE", "THIRD_PARTY_NOTICES.md"]) {
  for await (const path of new Bun.Glob(pattern).scan({ onlyFiles: true })) {
    const target = `${stagingPath}/${path}`;
    await mkdir(target.slice(0, target.lastIndexOf("/")), { recursive: true });
    await Bun.write(target, Bun.file(path));
  }
}
const result = Bun.spawn(["bun", "pm", "pack", "--ignore-scripts", "--destination", destinationPath], {
  cwd: stagingPath,
  stdout: "inherit",
  stderr: "inherit",
});
process.exitCode = await result.exited;

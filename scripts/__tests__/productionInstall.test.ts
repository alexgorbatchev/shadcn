import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, readdir, rm } from "node:fs/promises";
import manifest from "../../package.json";
import { runConsumerCommand } from "./helpers";

const consumerRoot = `${process.cwd()}/.tmp/production-install/${Date.now()}`;

async function installedPackages(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const names = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map(async (entry) =>
        entry.name.startsWith("@")
          ? (await readdir(`${directory}/${entry.name}`)).map((name) => `${entry.name}/${name}`)
          : [entry.name],
      ),
  );
  return names.flat().sort();
}

beforeAll(async () => {
  await mkdir(consumerRoot, { recursive: true });
  await runConsumerCommand(["npm", "pack", "--ignore-scripts", "--pack-destination", consumerRoot], process.cwd());
}, 60_000);
afterAll(async () => {
  await rm(consumerRoot, { recursive: true, force: true });
});

test("a production install adds no third-party packages beyond the consumer's own React", async () => {
  await Bun.write(
    `${consumerRoot}/package.json`,
    JSON.stringify({
      private: true,
      dependencies: {
        "@alexgorbatchev/shadcn": `./alexgorbatchev-shadcn-${manifest.version}.tgz`,
        react: manifest.peerDependencies.react,
        "react-dom": manifest.peerDependencies["react-dom"],
      },
    }),
  );
  await runConsumerCommand(["npm", "install", "--omit=dev", "--ignore-scripts"], consumerRoot);
  // Consumers install every other library themselves; patched implementations ship bundled.
  expect(await installedPackages(`${consumerRoot}/node_modules`)).toEqual([
    "@alexgorbatchev/shadcn",
    "react",
    "react-dom",
    "scheduler",
  ]);
}, 120_000);

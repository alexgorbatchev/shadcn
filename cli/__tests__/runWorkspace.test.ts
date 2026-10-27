import { afterAll, expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { createProgram } from "../createProgram";
import { runWorkspace } from "../runWorkspace";

const root = resolve(".tmp/prototype-process", crypto.randomUUID());
afterAll(async () => {
  process.exitCode = 0;
  await rm(root, { recursive: true, force: true });
});

async function fixtureRunner() {
  await mkdir(root, { recursive: true });
  await Bun.write(`${root}/vite.config.ts`, "export default {};");
  await Bun.write(
    `${root}/node_modules/vite/bin/vite.js`,
    'await Bun.write("arguments.json", JSON.stringify(process.argv.slice(2))); process.stdout.write("ready\\n"); process.stderr.write("diagnostic");',
  );
}

test("commands create a workspace and forward validated preview/build arguments", async () => {
  await fixtureRunner();
  const output: string[] = [];
  const options = {
    templateDirectory: resolve("templates/prototype"),
    isAgent: true,
    width: 100,
    writeOut: (text: string) => {
      output.push(text);
    },
    writeErr: () => {},
  };
  await createProgram(options).parseAsync(["workspace", "create", `${root}/created`], { from: "user" });
  expect(await Bun.file(`${root}/created/src/main.tsx`).exists()).toBe(true);
  expect(output.join("")).toBe(
    `Created ${root}/created\nRun bun install in that directory, then shadcn-prototype workspace start .\n`,
  );
  await createProgram(options).parseAsync(["workspace", "start", root, "--port", "0"], { from: "user" });
  expect(await Bun.file(`${root}/arguments.json`).json()).toEqual([
    "--host",
    "127.0.0.1",
    "--port",
    "0",
    "--strictPort",
  ]);
  await createProgram(options).parseAsync(["workspace", "build", root], { from: "user" });
  expect(await Bun.file(`${root}/arguments.json`).json()).toEqual(["build"]);
});

test("runner propagates unsuccessful child exit status", async () => {
  await fixtureRunner();
  await Bun.write(`${root}/node_modules/vite/bin/vite.js`, "process.exitCode = 7;");
  expect(await runWorkspace(root, "build", 0)).toBe(7);
});

test.each(["SIGINT", "SIGTERM"] as const)("%s stops the preview child and removes signal listeners", async (signal) => {
  await fixtureRunner();
  await rm(`${root}/ready`, { force: true });
  await Bun.write(
    `${root}/node_modules/vite/bin/vite.js`,
    'await Bun.write("ready", String(process.pid)); setInterval(() => {}, 1000);',
  );
  const before = [process.listenerCount("SIGINT"), process.listenerCount("SIGTERM")];
  const running = runWorkspace(root, "start", 0);
  try {
    const deadline = Date.now() + 3000;
    while (!(await Bun.file(`${root}/ready`).exists()) && Date.now() < deadline) await Bun.sleep(10);
    expect(await Bun.file(`${root}/ready`).exists()).toBe(true);
  } finally {
    process.emit(signal);
    expect(await running).not.toBe(0);
  }
  expect([process.listenerCount("SIGINT"), process.listenerCount("SIGTERM")]).toEqual(before);
  const pid = Number(await Bun.file(`${root}/ready`).text());
  expect(() => process.kill(pid, 0)).toThrow();
});

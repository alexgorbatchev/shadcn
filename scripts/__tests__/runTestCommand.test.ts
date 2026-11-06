import { expect, test } from "bun:test";
import { execa } from "execa";
import assert from "node:assert/strict";
import { mkdir, mkdtempDisposable, readdir, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { runTestCommand } from "../runTestCommand";
import { fixture_testArtifactWriter, fixture_testProcessTree, fixture_testSuiteWaiter } from "./fixtures";

interface IProcessReceipt {
  role: string;
  pid: number;
  scratch: string;
}

test.each([0, 7])("validation isolates temporary artifacts and removes them after exit %s", async (exitCode) => {
  await mkdir(".tmp", { recursive: true });
  await using directory = await mkdtempDisposable(resolve(".tmp/validation-regression-"));
  await mkdir(`${directory.path}/.tmp`);
  await mkdir(`${directory.path}/caller-temp`);
  await mkdir(`${directory.path}/caller-logs`);
  await mkdir(`${directory.path}/caller-cache`);
  await Bun.write(`${directory.path}/.tmp/unowned.txt`, "preserve");
  const result = await runTestCommand([process.execPath, "--eval", fixture_testArtifactWriter, String(exitCode)], {
    cwd: directory.path,
    env: {
      TMPDIR: `${directory.path}/caller-temp`,
      npm_config_logs_dir: `${directory.path}/caller-logs`,
      NODE_COMPILE_CACHE: `${directory.path}/caller-cache`,
    },
  }).catch((error: unknown) => error);
  expect(await readdir(`${directory.path}/caller-temp`)).toEqual([]);
  expect(await readdir(`${directory.path}/caller-logs`)).toEqual([]);
  expect(await readdir(`${directory.path}/caller-cache`)).toEqual([]);
  expect(await readdir(`${directory.path}/.tmp`)).toEqual(["unowned.txt"]);
  expect(result).toMatchObject({ exitCode, stdout: "written\n" });
});

test.each(["cancel", "timeout"])(
  "%s stops descendants before removing their temporary directory",
  async (reason) => {
    await using directory = await mkdtempDisposable(resolve(".tmp/validation-process-"));
    await Bun.write(`${directory.path}/tree.ts`, fixture_testProcessTree);
    const receipts = new Map<string, IProcessReceipt>();
    const readiness = new Map(["parent", "child"].map((role) => [role, Promise.withResolvers<void>()]));
    await using server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      async fetch(request) {
        const entry: IProcessReceipt = await request.json();
        receipts.set(entry.role, entry);
        readiness.get(entry.role)?.resolve();
        return new Response("ready");
      },
    });
    const controller = new AbortController();
    const running = runTestCommand(
      [process.execPath, `${directory.path}/tree.ts`, "parent", server.url.href, directory.path],
      { cancelSignal: controller.signal, timeout: 2000 },
    ).catch((error: unknown) => error);
    try {
      await Promise.race([Promise.all([...readiness.values()].map((entry) => entry.promise)), running]);
      expect(receipts.size).toBe(2);
      const actions: Record<string, () => void> = { cancel: () => controller.abort(), timeout: () => {} };
      actions[reason]?.();
      expect(await running).toMatchObject({
        failed: true,
        isCanceled: reason === "cancel",
        timedOut: reason === "timeout",
      });
      expect(await Bun.file(`${directory.path}/parent`).text()).toBe("terminated");
      expect(await Bun.file(`${directory.path}/child`).text()).toBe("terminated");
      for (const receipt of receipts.values()) {
        expect(() => process.kill(receipt.pid, 0)).toThrow();
        await expect(stat(receipt.scratch)).rejects.toMatchObject({ code: "ENOENT" });
      }
    } finally {
      controller.abort();
      await running;
    }
  },
  10_000,
);

test("package managers pack and install without changing caller temp or npm logs", async () => {
  await using directory = await mkdtempDisposable(resolve(".tmp/validation-package-"));
  await Bun.write(
    `${directory.path}/package/package.json`,
    JSON.stringify({ name: "artifact-fixture", version: "1.0.0" }),
  );
  await Bun.write(`${directory.path}/package/index.js`, 'export default "installed";');
  const packed = await runTestCommand(["npm", "pack", "--ignore-scripts", "--pack-destination", directory.path], {
    cwd: `${directory.path}/package`,
  });
  expect(packed.stdout).toBe("artifact-fixture-1.0.0.tgz\n");
  await Bun.write(
    `${directory.path}/consumer/package.json`,
    JSON.stringify({
      private: true,
      dependencies: { "artifact-fixture": `file:${directory.path}/artifact-fixture-1.0.0.tgz` },
    }),
  );
  await runTestCommand([process.execPath, "install", "--ignore-scripts"], { cwd: `${directory.path}/consumer` });
  expect(await Bun.file(`${directory.path}/consumer/node_modules/artifact-fixture/index.js`).text()).toBe(
    'export default "installed";',
  );
  const output = await runTestCommand(["npm", "config", "get", "logs-dir"], { cwd: directory.path });
  expect(basename(output.stdout.trim())).toBe("npm-logs");
  await expect(stat(output.stdout.trim())).rejects.toMatchObject({ code: "ENOENT" });
});

test.each([
  ["pass", 4, 0],
  ["fail", 5, 1],
] as const)(
  "Just validation preserves failure and bootstrap cleanup (%s)",
  async (outcome, expected, exitCode) => {
    await using directory = await mkdtempDisposable(resolve(".tmp/validation-bootstrap-"));
    await mkdir(`${directory.path}/caller-cache`);
    await mkdir(`${directory.path}/scripts`);
    await mkdir(`${directory.path}/cli`);
    await Bun.write(`${directory.path}/justfile`, Bun.file("justfile"));
    await Bun.write(`${directory.path}/cli/justfile`, Bun.file("cli/justfile"));
    await Bun.write(`${directory.path}/scripts/runValidation.ts`, Bun.file("scripts/runValidation.ts"));
    await Bun.write(`${directory.path}/scripts/runTestCommand.ts`, Bun.file("scripts/runTestCommand.ts"));
    await Bun.write(`${directory.path}/package.json`, JSON.stringify({ private: true }));
    await Bun.write(`${directory.path}/cli/bunfig.toml`, "[test]\n");
    await Bun.write(
      `${directory.path}/cli/pass.test.ts`,
      `import {expect,test} from "bun:test"; test("Just fixture",async()=>{await Bun.write("receipt.txt",${JSON.stringify(outcome)});expect(2+2).toBe(${expected});});`,
    );
    await Bun.write(`${directory.path}/scratch/unowned.txt`, "preserve");
    const result = await execa("just", ["prototype", "test", "--test-name-pattern", "Just fixture"], {
      cwd: directory.path,
      env: {
        NODE_COMPILE_CACHE: `${directory.path}/caller-cache`,
        NODE_DISABLE_COMPILE_CACHE: undefined,
        SHADCN_TEST_ROOT: `${directory.path}/scratch`,
      },
      killDescendants: true,
      reject: false,
      timeout: 5000,
    });
    expect(result.exitCode).toBe(exitCode);
    expect(await Bun.file(`${directory.path}/receipt.txt`).text()).toBe(outcome);
    expect(await readdir(`${directory.path}/caller-cache`)).toEqual([]);
    expect(await readdir(`${directory.path}/scratch`)).toEqual(["unowned.txt"]);
  },
  10_000,
);

test.each(["SIGINT", "SIGTERM"])(
  "validation runner waits for cleanup after %s",
  async (signal) => {
    await using directory = await mkdtempDisposable(resolve(".tmp/validation-suite-"));
    await Bun.write(`${directory.path}/cli/bunfig.toml`, "[test]\n");
    await Bun.write(`${directory.path}/cli/waiter.test.ts`, fixture_testSuiteWaiter);
    await Bun.write(`${directory.path}/scratch/unowned.txt`, "preserve");
    const ready = Promise.withResolvers<IProcessReceipt>();
    await using server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      async fetch(request) {
        ready.resolve(await request.json());
        return new Response("ready");
      },
    });
    const runner = execa(
      process.execPath,
      [resolve("scripts/runValidation.ts"), process.execPath, "test", "--config=./cli/bunfig.toml", "cli"],
      {
        cwd: directory.path,
        env: { SHADCN_TEST_ROOT: `${directory.path}/scratch`, FIXTURE_READY_URL: server.url.href },
        timeout: 5000,
        killDescendants: true,
      },
    );
    const result = runner.catch((error: unknown) => error);
    try {
      const receipt = await Promise.race([ready.promise, result.then(() => undefined)]);
      assert(receipt);
      runner.kill(signal);
      expect(await result).toMatchObject({ failed: true, timedOut: false });
      expect(await readdir(`${directory.path}/scratch`)).toEqual(["unowned.txt"]);
      expect(() => process.kill(receipt.pid, 0)).toThrow();
    } finally {
      runner.kill();
      await result;
    }
  },
  10_000,
);

import { expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { runConsumerCommand } from "./helpers.js";
import { fixture_coverageConfigSource, fixture_coverageTestSource } from "./fixtures.js";

interface ICoverageRecord {
  path: string;
  s: Record<string, number>;
}

test("coverage retains an uncovered module when Vite warms another module during its transform", async () => {
  const root = `${process.cwd()}/.tmp/coverage-race/${crypto.randomUUID()}`;
  await mkdir(root, { recursive: true });
  try {
    await Promise.all([
      Bun.write(`${root}/vitest.config.ts`, fixture_coverageConfigSource),
      Bun.write(`${root}/test/covered.test.ts`, fixture_coverageTestSource),
      Bun.write(`${root}/src/covered.ts`, "export const covered = (n: number) => n + 1;\n"),
      Bun.write(`${root}/src/uncovered.ts`, "export const uncovered = (n: number) => n > 0 ? n + 1 : n - 1;\n"),
      Bun.write(`${root}/src/other.ts`, "export const other = (n: number) => n * 2;\n"),
    ]);
    await runConsumerCommand(
      [
        "node",
        `${process.cwd()}/node_modules/vitest/vitest.mjs`,
        "run",
        "--config",
        `${root}/vitest.config.ts`,
        "--coverage",
      ],
      process.cwd(),
    );
    const coverage: Record<string, ICoverageRecord> = await Bun.file(`${root}/coverage/coverage-final.json`).json();
    expect(Object.keys(coverage).sort()).toEqual([
      `${root}/src/covered.ts`,
      `${root}/src/other.ts`,
      `${root}/src/uncovered.ts`,
    ]);
    expect(coverage[`${root}/src/uncovered.ts`]?.path).toBe(`${root}/src/uncovered.ts`);
    expect(Object.values(coverage[`${root}/src/uncovered.ts`]?.s ?? {}).every((hits) => hits === 0)).toBe(true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 30_000);

import { expect } from "bun:test";

type PackageExport = string | Record<string, string>;

export function getPackageExportTargets(exports: Record<string, PackageExport>): string[] {
  return Object.values(exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)));
}

export async function runConsumerCommand(command: string[], cwd: string): Promise<string> {
  const child = Bun.spawn(command, { cwd, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  expect(exitCode, stdout + stderr).toBe(0);
  return stdout;
}

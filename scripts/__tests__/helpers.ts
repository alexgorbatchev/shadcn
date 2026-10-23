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

interface IInstalledPackageDependencies {
  dependencies?: Record<string, string>;
}
/** Follow the actual selected engines' runtime dependencies, without following our optional peer list. */
export async function getInstalledRuntimeDependencies(cwd: string, selected: readonly string[]): Promise<Set<string>> {
  const dependencies = new Set<string>();
  const pending = [...selected];
  while (pending.length) {
    const name = pending.pop();
    if (!name || dependencies.has(name)) continue;
    dependencies.add(name);
    const file = Bun.file(`${cwd}/node_modules/${name}/package.json`);
    if (!(await file.exists())) continue;
    const manifest: IInstalledPackageDependencies = await file.json();
    pending.push(...Object.keys(manifest.dependencies ?? {}));
  }
  return dependencies;
}

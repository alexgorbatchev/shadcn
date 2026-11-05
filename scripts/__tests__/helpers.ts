import { runTestCommand } from "../runTestCommand";
import { afterAll, afterEach } from "bun:test";

const commands = new Map<AbortController, ReturnType<typeof runTestCommand>>();

async function stopCommands(): Promise<void> {
  for (const controller of commands.keys()) controller.abort();
  await Promise.allSettled(commands.values());
}

afterEach(stopCommands);
afterAll(stopCommands);

type PackageExport = string | Record<string, string>;

export function getPackageExportTargets(exports: Record<string, PackageExport>): string[] {
  return Object.values(exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)));
}

export async function runConsumerCommand(command: string[], cwd: string): Promise<string> {
  const controller = new AbortController();
  const running = runTestCommand(command, { cwd, cancelSignal: controller.signal });
  commands.set(controller, running);
  try {
    return (await running).stdout;
  } finally {
    commands.delete(controller);
  }
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

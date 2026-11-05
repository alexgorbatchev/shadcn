import { execa } from "execa";
import { mkdir, mkdtempDisposable } from "node:fs/promises";
import { resolve } from "node:path";

interface ITestCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  cancelSignal?: AbortSignal;
  timeout?: number;
  stdio?: "pipe" | "inherit";
}

interface ITestCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number | undefined;
}

export async function runTestCommand(
  command: string[],
  options: ITestCommandOptions = {},
): Promise<ITestCommandResult> {
  const [file, ...args] = command;
  if (!file) throw new Error("A validation command is required");
  const root = process.env.SHADCN_TEST_ROOT ?? resolve(".tmp");
  await mkdir(root, { recursive: true });
  await using directory = await mkdtempDisposable(`${root}/command-`);
  const temporary = `${directory.path}/tmp`;
  await mkdir(temporary);
  const result = await execa(file, args, {
    ...options,
    stripFinalNewline: false,
    killDescendants: true,
    env: {
      ...options.env,
      SHADCN_TEST_ROOT: directory.path,
      TMPDIR: temporary,
      TMP: temporary,
      TEMP: temporary,
      NODE_COMPILE_CACHE: `${directory.path}/node-cache`,
      npm_config_logs_dir: `${directory.path}/npm-logs`,
    },
  });
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "", exitCode: result.exitCode };
}

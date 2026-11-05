import { runTestCommand } from "./runTestCommand";

const suites: Record<string, string[][]> = {
  prototype: [
    [process.execPath, "test", "--config=./cli/bunfig.toml", "--coverage", "cli"],
    [process.execPath, "run", "vitest", "run", "--config", ".storybook/vitest.prototype.config.ts", "--coverage"],
  ],
  package: [
    [process.execPath, "run", "build"],
    [process.execPath, "test", "scripts/__tests__", "./.storybook/__tests__/createStorybookViteConfig.test.ts"],
  ],
  preview: [[process.execPath, "test", "scripts/storybookPreview.test.ts"]],
  storybook: [
    [process.execPath, "scripts/buildLlmDocs.ts"],
    ["storybook", "build"],
  ],
  cli: [[process.execPath, "test", "--config=./cli/bunfig.toml", "--coverage", "cli"]],
};

const commands = suites[process.argv[2] ?? ""];
if (!commands) throw new Error("Expected a validation suite: prototype, package, preview, storybook, or cli");
const controller = new AbortController();
const cancel = () => controller.abort();
process.on("SIGINT", cancel);
process.on("SIGTERM", cancel);
try {
  for (const command of commands) {
    await runTestCommand(command, { stdio: "inherit", cancelSignal: controller.signal });
  }
} finally {
  process.removeListener("SIGINT", cancel);
  process.removeListener("SIGTERM", cancel);
}

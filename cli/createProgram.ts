import { Command, InvalidArgumentError } from "commander";
import type { Help } from "commander";
import manifest from "../package.json";
import { createWorkspace } from "./createWorkspace";
import { runWorkspace } from "./runWorkspace";

type ProgramOptions = {
  templateDirectory: string;
  isAgent: boolean;
  width: number;
  writeOut: (text: string) => void;
  writeErr: (text: string) => void;
};

type StartOptions = { port: number };

export function createProgram(options: ProgramOptions): Command {
  const program = new Command("shadcn-prototype")
    .description("Create and preview editable React mockups.")
    .version(manifest.version)
    .exitOverride()
    .showHelpAfterError();
  program.configureOutput({ writeOut: options.writeOut, writeErr: options.writeErr });
  program.configureHelp({
    formatHelp(command: Command, helper: Help) {
      const lines = [`Usage: ${helper.commandUsage(command)}`, "", command.description(), "", "Options:"];
      for (const option of helper.visibleOptions(command)) lines.push(`  ${option.flags}  ${option.description}`);
      const visit = (parent: Command, prefix: string) => {
        const commands = helper.visibleCommands(parent);
        for (const [index, child] of commands.entries()) {
          const isLast = index === commands.length - 1;
          const marker = options.isAgent ? "- " : isLast ? "╰─ " : "├─ ";
          const name = `${prefix}${marker}${helper.subcommandTerm(child)}`;
          lines.push(options.isAgent ? `${name}: ${child.description()}` : `${name.padEnd(44)} ${child.description()}`);
          visit(child, `${prefix}${options.isAgent ? "  " : isLast ? "   " : "│  "}`);
        }
      };
      if (command.commands.length) {
        lines.push("", "Commands:");
        visit(command, "  ");
      }
      const body =
        lines
          .map((line) =>
            !options.isAgent && line.length > options.width
              ? `${line.slice(0, Math.max(0, options.width - 3))}...`
              : line,
          )
          .join("\n") + "\n";
      return options.isAgent
        ? "ALERT: Agents must read `AGENT=1 shadcn-prototype skill` before using this tool.\n" + body
        : body;
    },
  });
  program
    .command("skill")
    .description("Show the agent skill installation instructions.")
    .action(() => {
      options.writeOut(
        "Install the shadcn-prototype skill using the Skills CLI:\n\n  npx skills add alexgorbatchev/shadcn --skill shadcn-prototype\n\nSkill:\n\n  https://github.com/alexgorbatchev/shadcn/tree/main/skills/shadcn-prototype\n",
      );
    });
  const workspace = program.command("workspace").description("Manage local prototype workspaces.");
  workspace
    .command("create <directory>")
    .description("Create a workspace with three runnable recipes.")
    .action(async (directory: string) => {
      const destination = await createWorkspace(directory, options.templateDirectory);
      options.writeOut(
        `Created ${destination}\nRun bun install in that directory, then shadcn-prototype workspace start .\n`,
      );
    });
  workspace
    .command("start [directory]")
    .description("Preview a workspace with live updates.")
    .option(
      "-p, --port <number>",
      "Preview port (0 chooses an available port).",
      (value: string) => {
        const number = Number(value);
        if (!/^\d+$/.test(value) || !Number.isInteger(number) || number < 0 || number > 65535) {
          throw new InvalidArgumentError("Port must be an integer between 0 and 65535.");
        }
        return number;
      },
      5173,
    )
    .action(async (directory: string = ".", flags: StartOptions) => {
      process.exitCode = await runWorkspace(directory, "start", flags.port);
    });
  workspace
    .command("build [directory]")
    .description("Build a workspace for static hosting.")
    .action(async (directory: string = ".") => {
      process.exitCode = await runWorkspace(directory, "build", 0);
    });
  return program;
}

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
  const width = Number.isFinite(options.width) && options.width >= 1 ? Math.floor(options.width) : 100;
  const program = new Command("shadcn-prototype")
    .description("Create and preview editable React mockups.")
    .version(manifest.version)
    .exitOverride()
    .showHelpAfterError();
  program.configureOutput({ writeOut: options.writeOut, writeErr: options.writeErr });
  program.configureHelp({
    helpWidth: width,
    minWidthToWrap: 1,
    displayWidth: Bun.stringWidth,
    formatHelp(command: Command, helper: Help) {
      const wrap = (text: string) => (options.isAgent ? text : helper.boxWrap(text, width));
      const formatItem = (term: string, description: string, prefix = "  ", continuation = "  ") => {
        const prefixWidth = helper.displayWidth(prefix);
        const descriptionColumn = Math.max(prefixWidth + 2, Math.min(45, Math.floor(width / 2)));
        // Commander adds two cells of indentation and two between the term and description.
        const termWidth = descriptionColumn - 4;
        const connect = (line: string) => continuation + line.slice(continuation.length);
        if (prefixWidth + helper.displayWidth(term) + 2 > descriptionColumn) {
          const wrappedTerm = helper
            .boxWrap(term, Math.max(1, width - prefixWidth))
            .split("\n")
            .map((line, index) => `${index === 0 ? prefix : continuation}${line}`)
            .join("\n");
          if (!description) return wrappedTerm;
          const wrappedDescription = helper.formatItem("", termWidth, description, helper).split("\n").map(connect);
          return [wrappedTerm, ...wrappedDescription].join("\n");
        }
        return helper
          .formatItem(`${prefix.slice(2)}${term}`, termWidth, description, helper)
          .split("\n")
          .map((line, index) => (index === 0 ? line : connect(line)))
          .join("\n");
      };
      const lines = [wrap(`Usage: ${helper.commandUsage(command)}`), "", wrap(command.description()), "", "Options:"];
      for (const option of helper.visibleOptions(command)) {
        lines.push(
          options.isAgent ? `  ${option.flags}  ${option.description}` : formatItem(option.flags, option.description),
        );
      }
      const visit = (parent: Command, prefix: string) => {
        const commands = helper.visibleCommands(parent);
        for (const [index, child] of commands.entries()) {
          const isLast = index === commands.length - 1;
          const marker = options.isAgent ? "- " : isLast ? "╰─ " : "├─ ";
          const term = helper.subcommandTerm(child);
          const continuation = `${prefix}${options.isAgent ? "  " : isLast ? "   " : "│  "}`;
          lines.push(
            options.isAgent
              ? `${prefix}${marker}${term}: ${child.description()}`
              : formatItem(term, child.description(), `${prefix}${marker}`, continuation),
          );
          visit(child, continuation);
        }
      };
      if (command.commands.length) {
        lines.push("", "Commands:");
        visit(command, "  ");
      }
      const body = lines.join("\n") + "\n";
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

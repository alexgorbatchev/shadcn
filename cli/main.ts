#!/usr/bin/env bun
import { homedir } from "node:os";
import { resolve } from "node:path";
import { CommanderError } from "commander";
import { createProgram } from "./createProgram";
import { formatOutput } from "./formatOutput";

type MainOptions = {
  argv: string[];
  agent: string | undefined;
  home: string;
  width: number;
  writeOut: (text: string) => void;
  writeErr: (text: string) => void;
};

export async function main(
  options: MainOptions = {
    argv: process.argv,
    agent: process.env.AGENT,
    home: homedir(),
    width: process.stdout.columns || Number(process.env.COLUMNS) || 100,
    writeOut: (text) => process.stdout.write(text),
    writeErr: (text) => process.stderr.write(text),
  },
): Promise<number> {
  const isAgent = ["1", "true", "yes"].includes(options.agent ?? "");
  const program = createProgram({
    templateDirectory: resolve(import.meta.dirname, "../templates/prototype"),
    isAgent,
    width: options.width,
    writeOut: (text) => options.writeOut(formatOutput(text, options.home)),
    writeErr: (text) => options.writeErr(formatOutput(text, options.home)),
  });
  try {
    await program.parseAsync(options.argv);
    return Number(process.exitCode ?? 0);
  } catch (error) {
    if (error instanceof CommanderError) return error.exitCode;
    const message = error instanceof Error ? (isAgent ? (error.stack ?? error.message) : error.message) : String(error);
    options.writeErr(formatOutput(`ERR: ${message}\n`, options.home));
    return 1;
  }
}

if (import.meta.main) process.exitCode = await main();

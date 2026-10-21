import { describe, expect, test } from "vitest";
import { SearchIcon } from "lucide-react";
import { matchSlashCommands } from "../matchSlashCommands.js";
import type { IComposerCommand } from "../../elements/composer/types.js";

const commands: readonly IComposerCommand[] = [
  { name: "Review", description: "Review a change", icon: SearchIcon },
  { name: "run", description: "Run a command", icon: SearchIcon },
];
describe("matchSlashCommands", () => {
  test("matches command prefixes without case sensitivity", () => {
    expect(matchSlashCommands("/REV", commands).map((command) => command.name)).toEqual(["Review"]);
  });
  test("returns every command at the slash", () => {
    expect(matchSlashCommands("/", commands)).toEqual([...commands]);
  });
  test("does not search ordinary message text", () => {
    expect(matchSlashCommands("Review /run", commands)).toEqual([]);
  });
  test("handles missing commands", () => {
    expect(matchSlashCommands("/run", undefined)).toEqual([]);
  });
});

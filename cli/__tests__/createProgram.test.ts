import { expect, test } from "bun:test";
import { createProgram } from "../createProgram";
import manifest from "../../package.json";

function capture(isAgent: boolean, width = 100) {
  const output: string[] = [];
  const errors: string[] = [];
  const program = createProgram({
    templateDirectory: "templates/prototype",
    isAgent,
    width,
    writeOut: (text) => {
      output.push(text);
    },
    writeErr: (text) => {
      errors.push(text);
    },
  });
  return { program, output, errors };
}

const skillOutput =
  "Install the shadcn-prototype skill using the Skills CLI:\n\n  npx skills add alexgorbatchev/shadcn --skill shadcn-prototype\n\nSkill:\n\n  https://github.com/alexgorbatchev/shadcn/tree/main/skills/shadcn-prototype\n";

test.each([true, false])("skill output is complete and offline (agent=%s)", async (isAgent) => {
  const { program, output } = capture(isAgent);
  await program.parseAsync(["skill"], { from: "user" });
  expect(output.join("")).toBe(skillOutput);
});

test("skill rejects extra arguments", async () => {
  const { program } = capture(true);
  await expect(program.parseAsync(["skill", "extra"], { from: "user" })).rejects.toMatchObject({ exitCode: 1 });
});

test("output failures propagate", async () => {
  const program = createProgram({
    templateDirectory: "templates/prototype",
    isAgent: true,
    width: 100,
    writeOut: () => {
      throw new Error("output closed");
    },
    writeErr: () => {},
  });
  await expect(program.parseAsync(["skill"], { from: "user" })).rejects.toThrow("output closed");
});

test.each([[], ["workspace"], ["workspace", "create"], ["workspace", "start"], ["workspace", "build"], ["skill"]])(
  "agent help starts with guidance for %j",
  async (...args) => {
    const { program, output } = capture(true);
    await expect(program.parseAsync([...args, "--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
    expect(output.join("").split("\n")[0]).toBe(
      "ALERT: Agents must read `AGENT=1 shadcn-prototype skill` before using this tool.",
    );
  },
);

test("human help fits the requested width and includes nested commands", async () => {
  const { program, output } = capture(false, 60);
  await expect(program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  const lines = output.join("").trimEnd().split("\n");
  expect(lines.every((line) => line.length <= 60)).toBe(true);
  expect(lines.some((line) => line.includes("create <directory>"))).toBe(true);
  expect(lines.some((line) => line.includes("start [options] [directory]"))).toBe(true);
  expect(lines.some((line) => line.includes("help [command]"))).toBe(true);
});

test("raw version remains unadorned", async () => {
  const { program, output } = capture(true);
  await expect(program.parseAsync(["--version"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  expect(output.join("")).toBe(`${manifest.version}\n`);
});

test.each(["-1", "65536", "no", "1.5", ""])("rejects invalid port %s", async (port) => {
  const { program } = capture(true);
  await expect(program.parseAsync(["workspace", "start", "--port", port], { from: "user" })).rejects.toMatchObject({
    exitCode: 1,
  });
});

test("the linked skill documents the live command interface", async () => {
  const { program, output } = capture(true);
  await program.parseAsync(["skill"], { from: "user" });
  const path = new URL(output.join("").trim().split("\n").at(-1) ?? "").pathname.replace(
    "/alexgorbatchev/shadcn/tree/main/",
    "",
  );
  const source = await Bun.file(`${path}/SKILL.md`).text();
  expect(source.split("\n").find((line) => line.startsWith("name:"))).toBe("name: shadcn-prototype");
  const visit = (command: typeof program) => {
    for (const child of command.commands) {
      expect(source.includes(`\`${child.name()}\``)).toBe(true);
      for (const option of child.options) expect(source.includes(option.flags)).toBe(true);
      visit(child);
    }
  };
  visit(program);
});

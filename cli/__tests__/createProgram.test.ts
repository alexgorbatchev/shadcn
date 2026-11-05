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

function helpContent(text: string): string {
  return text
    .replace(/^[ │├╰─]+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

test.each([1, 20, 40, 60, 80, 100])("human help preserves complete text at width %s", async (width) => {
  const narrow = capture(false, width);
  const wide = capture(false, 1000);
  await expect(narrow.program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  await expect(wide.program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  expect(helpContent(narrow.output.join(""))).toBe(helpContent(wide.output.join("")));
});

test.each([40, 60, 80, 100])("human help fits terminal cells at width %s", async (width) => {
  const { program, output } = capture(false, width);
  await expect(program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  for (const line of output.join("").split("\n")) expect(Bun.stringWidth(line)).toBeLessThanOrEqual(width);
});

test("narrow human help aligns descriptions and connects nested tree continuations", async () => {
  const { program, output } = capture(false, 40);
  await expect(program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  expect(output.join("")).toMatchInlineSnapshot(`
    "Usage: shadcn-prototype [options]
    [command]

    Create and preview editable React
    mockups.

    Options:
      -V, --version     output the version
                        number
      -h, --help        display help for
                        command

    Commands:
      ├─ skill          Show the agent skill
      │                 installation
      │                 instructions.
      ├─ workspace      Manage local
      │                 prototype
      │                 workspaces.
      │  ├─ create <directory>
      │  │              Create a workspace
      │  │              with three runnable
      │  │              recipes.
      │  ├─ start [options] [directory]
      │  │              Preview a workspace
      │  │              with live updates.
      │  ├─ build [directory]
      │  │              Build a workspace
      │  │              for static hosting.
      │  ╰─ help [command]
      │                 display help for
      │                 command
      ╰─ help [command]
                        display help for
                        command
    "
  `);
});

test.each([[], ["workspace"], ["workspace", "create"], ["workspace", "start"], ["workspace", "build"], ["skill"]])(
  "narrow human help preserves usage, options and descriptions for %j",
  async (...args) => {
    const narrow = capture(false, 40);
    const wide = capture(false, 1000);
    await expect(narrow.program.parseAsync([...args, "--help"], { from: "user" })).rejects.toMatchObject({
      exitCode: 0,
    });
    await expect(wide.program.parseAsync([...args, "--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
    expect(helpContent(narrow.output.join(""))).toBe(helpContent(wide.output.join("")));
    for (const line of narrow.output.join("").split("\n")) expect(Bun.stringWidth(line)).toBeLessThanOrEqual(40);
  },
);

test("human help preserves an indivisible term even when it exceeds the terminal width", async () => {
  const { program, output } = capture(false, 20);
  program.command("a-very-long-command-without-whitespace");
  await expect(program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  expect(
    output
      .join("")
      .split("\n")
      .find((line) => line.startsWith("  ├─ a-very")),
  ).toBe("  ├─ a-very-long-command-without-whitespace");
});

test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("unknown human width %s uses the default", async (width) => {
  const unknown = capture(false, width);
  const fallback = capture(false);
  await expect(unknown.program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  await expect(fallback.program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  expect(unknown.output.join("")).toBe(fallback.output.join(""));
});

test.each([[], ["workspace"], ["workspace", "create"], ["workspace", "start"], ["workspace", "build"], ["skill"]])(
  "agent help remains byte-identical at every width for %j",
  async (...args) => {
    const baseline = capture(true);
    await expect(baseline.program.parseAsync([...args, "--help"], { from: "user" })).rejects.toMatchObject({
      exitCode: 0,
    });
    for (const width of [1, 20, 40, 60, 100, 0, Number.NaN]) {
      const { program, output } = capture(true, width);
      await expect(program.parseAsync([...args, "--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
      expect(output.join("")).toBe(baseline.output.join(""));
    }
  },
);

test("human help preserves wide, combining and styled Unicode text within terminal cells", async () => {
  const narrow = capture(false, 40);
  const wide = capture(false, 1000);
  for (const { program } of [narrow, wide]) {
    program.description("預覽 音樂 🎧 cafe\u0301 彩色 預覽 音樂 🎧 cafe\u0301 彩色 預覽 音樂");
    program.option("--展示 <名称>", "\u001b[32m音樂\u001b[0m 🎧 cafe\u0301 預覽 彩色 音樂 🎧 cafe\u0301 預覽 彩色");
    program.command("展示 <名称>").description("音樂 🎧 cafe\u0301 預覽 彩色 音樂 🎧 cafe\u0301 預覽 彩色");
    await expect(program.parseAsync(["--help"], { from: "user" })).rejects.toMatchObject({ exitCode: 0 });
  }
  expect(helpContent(narrow.output.join(""))).toBe(helpContent(wide.output.join("")));
  for (const line of narrow.output.join("").split("\n")) expect(Bun.stringWidth(line)).toBeLessThanOrEqual(40);
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

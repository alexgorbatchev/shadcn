import { expect, spyOn, test } from "bun:test";
import { main } from "../main";
import manifest from "../../package.json";

test("default invocation reads process arguments and writes to the native output streams", async () => {
  const argv = process.argv;
  const output = spyOn(process.stdout, "write").mockReturnValue(true);
  const errors = spyOn(process.stderr, "write").mockReturnValue(true);
  try {
    process.argv = ["bun", "prototype", "--version"];
    expect(await main()).toBe(0);
    expect(output).toHaveBeenCalledWith(`${manifest.version}\n`);
    process.argv = ["bun", "prototype", "--invalid"];
    expect(await main()).toBe(1);
    expect(errors.mock.calls.flat().join("")).toContain("unknown option '--invalid'");
  } finally {
    process.argv = argv;
    output.mockRestore();
    errors.mockRestore();
  }
});

test("entrypoint reports the version without agent decoration", async () => {
  const output: string[] = [];
  const errors: string[] = [];
  const result = await main({
    argv: ["bun", "prototype", "--version"],
    agent: "yes",
    home: "/home/dev",
    width: 100,
    writeOut: (text) => {
      output.push(text);
    },
    writeErr: (text) => {
      errors.push(text);
    },
  });
  expect(result).toBe(0);
  expect(output.join("")).toBe(`${manifest.version}\n`);
  expect(errors).toEqual([]);
});

test("entrypoint returns a nonzero result for invalid arguments", async () => {
  const errors: string[] = [];
  const result = await main({
    argv: ["bun", "prototype", "workspace", "start", "--port", "invalid"],
    agent: undefined,
    home: "/home/dev",
    width: 100,
    writeOut: () => {},
    writeErr: (text) => {
      errors.push(text);
    },
  });
  expect(result).toBe(1);
  expect(errors.join("").split("\n")[0]).toBe(
    "error: option '-p, --port <number>' argument 'invalid' is invalid. Port must be an integer between 0 and 65535.",
  );
});

test.each(["true", "0"])("entrypoint reports operational failures (AGENT=%s)", async (agent) => {
  const errors: string[] = [];
  const result = await main({
    argv: ["bun", "prototype", "workspace", "build", "/absent-prototype-workspace"],
    agent,
    home: "/home/dev",
    width: 100,
    writeOut: () => {},
    writeErr: (text) => {
      errors.push(text);
    },
  });
  expect(result).toBe(1);
  expect(errors.join("").startsWith("ERR: ")).toBe(true);
  expect(errors.join("").includes("No prototype workspace at /absent-prototype-workspace.")).toBe(true);
});

test("entrypoint runs the skill command successfully", async () => {
  const output: string[] = [];
  expect(
    await main({
      argv: ["bun", "prototype", "skill"],
      agent: "1",
      home: "/home/dev",
      width: 100,
      writeOut: (text) => {
        output.push(text);
      },
      writeErr: () => {},
    }),
  ).toBe(0);
  expect(output.length).toBe(1);
});

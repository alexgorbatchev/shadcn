import { expect, test } from "bun:test";
import { formatOutput } from "../formatOutput";

test.each([
  ["/home/dev", "~"],
  ["Created /home/dev/project\n", "Created ~/project\n"],
  ["/home/developer/project", "/home/developer/project"],
  ["/tmp/project", "/tmp/project"],
  ["ENOENT '/home/dev/project'", "ENOENT '~/project'"],
  ["/other/home/dev/project", "/other/home/dev/project"],
])("formats output %s", (input, expected) => {
  expect(formatOutput(input, "/home/dev")).toBe(expected);
});

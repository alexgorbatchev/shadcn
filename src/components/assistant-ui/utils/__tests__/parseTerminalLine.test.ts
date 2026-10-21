import { expect, test } from "vitest";
import { parseTerminalLine } from "../parseTerminalLine.js";
test("does not expose the parameters of a truncated control sequence", () => {
  expect(parseTerminalLine("before\u001b[31").text).toBe("before");
});
test.each(["\u001b(", "\u001b#", "\u001b "])("does not expose truncated ESC intermediate sequence %j", (sequence) => {
  expect(parseTerminalLine(`before${sequence}`).text).toBe("before");
});
test("retains text after a complete ESC intermediate sequence", () => {
  expect(parseTerminalLine("before\u001b#8text").text).toBe("beforetext");
});
test("retains native RGB backgrounds and simultaneous text decorations", () => {
  const result = parseTerminalLine("\u001b[48;2;12;34;56m\u001b[1;3;4;9mstyled\u001b[0mplain");
  expect(result.fragments[0]).toMatchObject({
    backgroundColor: "rgb(12, 34, 56)",
    isBold: true,
    isItalic: true,
    isUnderline: true,
    isStrikethrough: true,
  });
  expect(result.fragments[1]).toMatchObject({
    backgroundColor: null,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
  });
});
test("resets dim emphasis independently of displayed text", () => {
  const result = parseTerminalLine("\u001b[2mdim\u001b[22mnormal");
  expect(result.fragments[0]).toMatchObject({ text: "dim", isDim: true });
  expect(result.fragments[1]).toMatchObject({ text: "normal", isDim: false });
});
test("removes C1 OSC control strings while preserving their visible label", () => {
  expect(parseTerminalLine("\u009d8;;https://example.com\u0007label\u009d8;;\u0007").text).toBe("label");
});
test("ignores private device-control payloads rather than displaying them", () => {
  expect(parseTerminalLine("before\u001bPprivate\u001b\\after").text).toBe("beforeafter");
});
test("does not interpret SGR inside an OSC control string as displayed styling", () => {
  const result = parseTerminalLine("\u001b]0;title\u001b[31m\u0007label");
  expect(result.text).toBe("label");
  expect(result.fragments[0].foregroundColor).toBeNull();
});
test("preserves16-color terminal emphasis and reset", () => {
  const result = parseTerminalLine("before \u001b[1;31merror\u001b[0m after");
  expect(result.text).toBe("before error after");
  expect(result.fragments[1]).toMatchObject({
    text: "error",
    foregroundColor: "rgb(187, 0, 0)",
    isBold: true,
    isDim: false,
  });
  expect(result.fragments[2]).toMatchObject({ text: " after", foregroundColor: null, isBold: false });
});
test("removes hyperlink control strings while retaining the visible label", () => {
  expect(parseTerminalLine("\u001b]8;;https://example.com\u0007documentation\u001b]8;;\u0007").text).toBe(
    "documentation",
  );
});
test("normalizes C1 controls before parsing", () => {
  const result = parseTerminalLine("one\u009b31mtwo\u009b0m");
  expect(result.text).toBe("onetwo");
  expect(result.fragments[1]).toMatchObject({ text: "two", foregroundColor: "rgb(187, 0, 0)" });
});
test("retains indexed and truecolor terminal data", () => {
  const result = parseTerminalLine("\u001b[38;5;196mindexed\u001b[38;2;12;34;56mrgb");
  expect(result.text).toBe("indexedrgb");
  expect(result.fragments[0].foregroundColor).toBe("rgb(255, 0, 0)");
  expect(result.fragments[1].foregroundColor).toBe("rgb(12, 34, 56)");
});
test.each(["\u001b", "\u001b[31", "\u001b( "])("discards incomplete terminal command %j", (command) => {
  expect(parseTerminalLine(`before${command}`).text).toBe("before");
});
test("continues visible text after an invalid intermediate command terminator", () => {
  expect(parseTerminalLine("before\u001b(\u0007after").text).toBe("before\u0007after");
});

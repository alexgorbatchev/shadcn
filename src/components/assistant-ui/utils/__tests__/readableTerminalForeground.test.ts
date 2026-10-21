import { expect, test } from "vitest";
import Color from "colorjs.io";
import { readableTerminalForeground } from "../readableTerminalForeground.js";

test.each(["#121417", "white", "rgb(23, 43, 56)"])(
  "makes a low-contrast protocol color readable against %s",
  (background) => {
    const result = readableTerminalForeground("rgb(120, 120, 120)", background);
    expect(new Color(result).contrastWCAG21(background)).toBeGreaterThanOrEqual(4.5);
  },
);

test("preserves an already readable truecolor foreground exactly", () => {
  const foreground = "rgb(12, 34, 56)";
  expect(readableTerminalForeground(foreground, "white")).toBe(foreground);
});

test("retains the red hue while increasing contrast on a dark terminal", () => {
  const result = new Color(readableTerminalForeground("rgb(187, 0, 0)", "#121417"));
  const [red, green, blue] = result.to("srgb").coords;
  expect(red).toBeGreaterThan(green ?? 0);
  expect(red).toBeGreaterThan(blue ?? 0);
  expect(result.contrastWCAG21("#121417")).toBeGreaterThanOrEqual(4.5);
});
test("dims a readable foreground without crossing the contrast floor", () => {
  const surface = "#121417";
  const original = new Color("white");
  const result = new Color(readableTerminalForeground("white", surface, true));
  expect(result.contrastWCAG21(surface)).toBeGreaterThanOrEqual(4.5);
  expect(result.contrastWCAG21(surface)).toBeLessThan(original.contrastWCAG21(surface));
});

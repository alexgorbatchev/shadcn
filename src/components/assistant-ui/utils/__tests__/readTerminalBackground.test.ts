import { afterEach, expect, test } from "vitest";
import { readTerminalBackground } from "../readTerminalBackground.js";

const mounted: HTMLElement[] = [];
afterEach(() => {
  for (const element of mounted.splice(0)) element.remove();
});

test("uses the browser compositor for a transparent nested surface", () => {
  const outer = document.createElement("div");
  const inner = document.createElement("span");
  outer.style.backgroundColor = "rgb(20, 40, 60)";
  inner.style.backgroundColor = "rgb(100 120 140 / 50%)";
  outer.append(inner);
  document.body.append(outer);
  mounted.push(outer);
  expect(readTerminalBackground(inner)).toBe("rgb(60, 80, 100)");
});

test("reads the actual inherited backdrop across a native shadow root", () => {
  const host = document.createElement("div");
  host.style.backgroundColor = "rgb(12, 34, 56)";
  const root = host.attachShadow({ mode: "open" });
  const text = document.createElement("span");
  root.append(text);
  document.body.append(host);
  mounted.push(host);
  expect(readTerminalBackground(text)).toBe("rgb(12, 34, 56)");
});

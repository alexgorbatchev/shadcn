import { afterEach, beforeEach, expect, test } from "vitest";
import { collectLayoutViolations } from "../collectLayoutViolations";

let boundary: HTMLDivElement;
let child: HTMLDivElement;
beforeEach(() => {
  boundary = document.createElement("div");
  boundary.setAttribute("data-layout-boundary", "");
  boundary.style.cssText = "position:relative;width:100px;height:100px";
  child = document.createElement("div");
  child.style.cssText = "position:absolute;left:0;top:0;width:50px;height:50px";
  boundary.append(child);
  document.body.append(boundary);
});
afterEach(() => boundary.remove());

test("finds every escaped edge, identifies the element, and includes a marked root", () => {
  child.id = "escaped";
  child.style.cssText = "position:absolute;left:-10px;top:-20px;width:140px;height:160px";
  const violations = collectLayoutViolations(boundary);
  expect(violations.map(({ edge, overflow }) => ({ edge, overflow }))).toEqual([
    { edge: "left", overflow: 10 },
    { edge: "right", overflow: 30 },
    { edge: "top", overflow: 20 },
    { edge: "bottom", overflow: 40 },
  ]);
  expect(violations[0]?.message).toContain("div#escaped");
  expect(collectLayoutViolations(document)).toHaveLength(4);
});

test("allows fitting geometry and subpixel rounding, with configurable tolerance", () => {
  child.style.width = "100.5px";
  expect(collectLayoutViolations(boundary)).toEqual([]);
  expect(collectLayoutViolations(boundary, 0)).toHaveLength(1);
});

test.each(["x", "y"])("checks only the declared %s axis", (axis) => {
  boundary.setAttribute("data-layout-boundary", axis);
  child.style.width = "150px";
  child.style.height = "150px";
  expect(collectLayoutViolations(boundary).map(({ edge }) => edge)).toEqual([axis === "x" ? "right" : "bottom"]);
});

test.each([
  "display:none",
  "visibility:hidden",
  "opacity:0",
  "position:absolute;clip:rect(0,0,0,0)",
  "clip-path:inset(50%)",
])("ignores deliberately hidden content: %s", (css) => {
  child.style.cssText = `width:200px;height:200px;${css}`;
  expect(collectLayoutViolations(boundary)).toEqual([]);
});

test("ignores inert offcanvas content and explicit, reasoned exclusions", () => {
  child.style.width = "200px";
  boundary.inert = true;
  expect(collectLayoutViolations(boundary)).toEqual([]);
  boundary.inert = false;
  child.setAttribute("data-layout-exclude", "Decorative edge ornament");
  expect(collectLayoutViolations(boundary)).toEqual([]);
});

test("allows vertical scroll displacement without exempting horizontal overflow", () => {
  child.style.cssText = "height:100px;width:100px;overflow-y:auto;overflow-x:hidden";
  const content = document.createElement("div");
  content.style.cssText = "height:300px;width:130px";
  child.append(content);
  child.scrollTop = 40;
  expect(collectLayoutViolations(boundary).map(({ edge }) => edge)).toEqual(["right"]);
});

test("detects escaped text even when its element fits and overflow is hidden", () => {
  child.style.cssText = "width:100px;white-space:nowrap;overflow:hidden";
  child.textContent = "This long label cannot fit inside the narrow boundary";
  expect(collectLayoutViolations(boundary).map(({ edge }) => edge)).toEqual(["right"]);
  child.style.textOverflow = "ellipsis";
  expect(collectLayoutViolations(boundary)).toEqual([]);
});

test("rejects clipped controls inside fitting containers", () => {
  child.style.overflow = "hidden";
  const button = document.createElement("button");
  button.style.cssText = "width:80px;height:20px";
  child.append(button);
  expect(collectLayoutViolations(boundary).map(({ edge }) => edge)).toEqual(["right"]);
});

test("checks SVG icon boxes without treating their internal coordinate system as layout", () => {
  child.innerHTML = '<svg width="200" height="20"><path d="M0 0 L300 0" /></svg>';
  expect(collectLayoutViolations(boundary).map(({ edge }) => edge)).toEqual(["right"]);
});

test("discovers separately marked portals and skips detached documents", () => {
  const portal = document.createElement("div");
  portal.setAttribute("data-layout-boundary", "");
  portal.style.cssText = "width:20px;height:20px";
  boundary.append(portal);
  portal.append(child);
  expect(collectLayoutViolations(document).some(({ boundary: target }) => target === portal)).toBe(true);
  expect(collectLayoutViolations(document.implementation.createHTMLDocument())).toEqual([]);
});

test("checks direct boundary text and refuses an empty exclusion", () => {
  boundary.style.whiteSpace = "nowrap";
  boundary.append("A long unwrapped title escaping its own boundary");
  expect(collectLayoutViolations(boundary).some(({ element }) => element === boundary)).toBe(true);
  boundary.lastChild?.remove();
  child.style.width = "150px";
  child.setAttribute("data-layout-exclude", "");
  expect(collectLayoutViolations(boundary)).toHaveLength(1);
});

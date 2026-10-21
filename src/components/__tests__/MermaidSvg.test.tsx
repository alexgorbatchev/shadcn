import { expect, test } from "vitest";
import { commands } from "vitest/browser";
import { render } from "vitest-browser-react";
import { renderMermaidSVG } from "beautiful-mermaid";
import { MermaidSvg } from "../assistant-ui/elements/MermaidSvg.js";

test("isolates maintained SVG styles from surrounding illustrations", async () => {
  const outside = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.textContent = "Outside typography";
  outside.append(text);
  document.body.append(outside);
  const inheritedFont = getComputedStyle(text).fontFamily;
  try {
    const screen = await render(
      <MermaidSvg svg={renderMermaidSVG("graph LR\n A --> B", { font: "JetBrains Mono" })} />,
    );
    const host = screen.getByTestId("MermaidSvg").element();
    await expect.poll(() => host.shadowRoot).not.toBeNull();
    await expect.poll(() => getComputedStyle(text).fontFamily).toBe(inheritedFont);
    expect(host.shadowRoot?.querySelector("svg")).not.toBeNull();
  } finally {
    outside.remove();
  }
});

test("renders diagrams without requesting remote font stylesheets", async () => {
  await commands.beginResourceRequests();
  let requests: string[];
  try {
    const screen = await render(
      <MermaidSvg svg={renderMermaidSVG("graph LR\n A --> B", { font: "JetBrains Mono" })} />,
    );
    const host = screen.getByTestId("MermaidSvg").element();
    host.getBoundingClientRect();
    // Flush native layout and painting before reading the server-side request log.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  } finally {
    requests = await commands.endResourceRequests();
  }
  expect(requests.filter((url) => /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//.test(url))).toEqual([]);
});

import { describe, expect, test } from "vitest";
import { getDiagramSvgSize, prepareDiagramSvg } from "../prepareDiagramSvg";

const sampleSvg = [
  '<svg id="m1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360" style="max-width: 640px;">',
  '<style>@import url("https://example.invalid/font.css"); #m1 .node { fill: url(#grad); }</style>',
  '<defs><linearGradient id="grad"><stop offset="0%" stop-color="#fff"/></linearGradient><marker id="arrow"><path d="M0 0L10 5L0 10z"/></marker></defs>',
  '<g id="layer" aria-labelledby="title-node"><path marker-end="url(#arrow)" d="M0 0L100 0"/><use href="#arrow"/><text id="title-node">charge</text></g>',
  "</svg>",
].join("");

describe("getDiagramSvgSize", () => {
  test("reads natural dimensions from viewBox and falls back to explicit attributes", () => {
    expect(getDiagramSvgSize(sampleSvg)).toEqual({ width: 640, height: 360 });
    expect(getDiagramSvgSize('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220"></svg>')).toEqual({
      width: 400,
      height: 220,
    });
    expect(
      getDiagramSvgSize('<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"></svg>'),
    ).toBeUndefined();
    expect(getDiagramSvgSize("<div>not svg</div>")).toBeUndefined();
  });
});

describe("prepareDiagramSvg", () => {
  test("strips @import rules, prefixes internal IDs and references, and sets accessible naming", () => {
    const svg = prepareDiagramSvg(sampleSvg, document, {
      idPrefix: "copy-a",
      label: "Payments failure sequence",
      describedBy: "desc-1",
      fit: "fill",
    });

    expect(svg.getAttribute("id")).toBe("copy-a-m1");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Payments failure sequence");
    expect(svg.getAttribute("aria-describedby")).toBe("desc-1");
    expect(svg.getAttribute("width")).toBe("100%");
    expect(svg.getAttribute("height")).toBe("100%");
    expect(svg.style.maxWidth).toBe("none");

    const styleText = svg.querySelector("style")?.textContent ?? "";
    expect(styleText).not.toContain("@import");
    expect(styleText).toContain("#copy-a-m1");
    expect(styleText).toContain("url(#copy-a-grad)");
    expect(svg.querySelector("#copy-a-arrow")).not.toBeNull();
    expect(svg.querySelector("#copy-a-layer path")?.getAttribute("marker-end")).toBe("url(#copy-a-arrow)");
    expect(svg.querySelector("use")?.getAttribute("href")).toBe("#copy-a-arrow");
    expect(svg.querySelector("#copy-a-layer")?.getAttribute("aria-labelledby")).toBe("copy-a-title-node");
  });

  test("supports inline sizing and external labelledBy without overriding viewBox", () => {
    const bareSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"><text>Flow</text></svg>';
    const svg = prepareDiagramSvg(bareSvg, document, {
      idPrefix: "inline-1",
      labelledBy: "caption-1",
      fit: "inline",
    });

    expect(svg.getAttribute("aria-labelledby")).toBe("caption-1");
    expect(svg.hasAttribute("aria-label")).toBe(false);
    expect(svg.getAttribute("viewBox")).toBe("0 0 300 150");
    expect(svg.style.width).toBe("100%");
    expect(svg.style.maxWidth).toBe("300px");
    expect(svg.style.height).toBe("auto");
  });

  test("rejects non-SVG documents", () => {
    expect(() => prepareDiagramSvg("<div>oops</div>", document, { idPrefix: "x" })).toThrow(/invalid SVG/i);
  });
});

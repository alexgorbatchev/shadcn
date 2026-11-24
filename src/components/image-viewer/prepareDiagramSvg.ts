import type { IImageSize } from "./types.js";

export interface IPrepareDiagramSvgOptions {
  /** Prefix added to every internal SVG ID so inline and expanded copies never collide. */
  idPrefix: string;
  /** Accessible name applied to the live `<svg>` when `labelledBy` is not provided. */
  label?: string;
  /** ID of an external element labelling the `<svg>`. */
  labelledBy?: string;
  /** ID of an element describing the `<svg>`. */
  describedBy?: string;
  /** `inline` keeps responsive width with natural aspect ratio; `fill` stretches cleanly to a zoom stage. */
  fit?: "inline" | "fill";
}

function parseLength(value: string | null): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) return undefined;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseViewBox(value: string | null): IImageSize | undefined {
  if (!value) return undefined;
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4) return undefined;
  const width = parts[2];
  const height = parts[3];
  if (width === undefined || height === undefined || !Number.isFinite(width) || !Number.isFinite(height)) {
    return undefined;
  }
  return width > 0 && height > 0 ? { width, height } : undefined;
}

/** Reads a diagram SVG's natural dimensions from its `viewBox`, falling back to explicit numeric `width`/`height`. */
export function getDiagramSvgSize(svg: string): IImageSize | undefined {
  if (typeof DOMParser === "undefined") return undefined;
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = parsed.documentElement;
  if (root.localName !== "svg") return undefined;
  const fromViewBox = parseViewBox(root.getAttribute("viewBox"));
  if (fromViewBox) return fromViewBox;
  const width = parseLength(root.getAttribute("width"));
  const height = parseLength(root.getAttribute("height"));
  return width && height ? { width, height } : undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripImportRules(root: Element, ownerDocument: Document): void {
  const detached = ownerDocument.implementation.createHTMLDocument();
  for (const source of root.querySelectorAll("style")) {
    const style = detached.createElement("style");
    style.textContent = source.textContent;
    detached.head.append(style);
    const sheet = style.sheet;
    if (sheet) {
      for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
        const rule = sheet.cssRules[index];
        if (rule && rule.cssText.trimStart().startsWith("@import")) sheet.deleteRule(index);
      }
      source.textContent = Array.from(sheet.cssRules, (rule) => rule.cssText).join("\n");
    } else {
      source.textContent = (source.textContent ?? "").replace(/@import\s+[^;]+;/gi, "");
    }
    style.remove();
  }
}

function prefixSvgIds(root: Element, prefix: string): void {
  const idMap = new Map<string, string>();
  const elements = [root, ...Array.from(root.querySelectorAll("[id]"))];
  for (const element of elements) {
    const oldId = element.getAttribute("id");
    if (!oldId || idMap.has(oldId)) continue;
    const nextId = `${prefix}-${oldId}`;
    idMap.set(oldId, nextId);
    element.setAttribute("id", nextId);
  }
  if (idMap.size === 0) return;

  const sortedIds = [...idMap.keys()].sort((a, b) => b.length - a.length);
  const selectorPattern = new RegExp(`#(${sortedIds.map(escapeRegExp).join("|")})(?![A-Za-z0-9_-])`, "g");
  const urlPattern = new RegExp(`url\\(\\s*["']?#(${sortedIds.map(escapeRegExp).join("|")})["']?\\s*\\)`, "g");

  for (const style of root.querySelectorAll("style")) {
    if (!style.textContent) continue;
    style.textContent = style.textContent
      .replace(urlPattern, (_match, id: string) => `url(#${idMap.get(id) ?? id})`)
      .replace(selectorPattern, (_match, id: string) => `#${idMap.get(id) ?? id}`);
  }

  for (const element of [root, ...Array.from(root.querySelectorAll("*"))]) {
    for (const attr of Array.from(element.attributes)) {
      if (attr.name === "id") continue;
      if (attr.name === "href" || attr.name === "xlink:href") {
        if (attr.value.startsWith("#")) {
          const target = attr.value.slice(1);
          const mapped = idMap.get(target);
          if (mapped) element.setAttribute(attr.name, `#${mapped}`);
        }
        continue;
      }
      if (attr.name === "aria-labelledby" || attr.name === "aria-describedby") {
        const replaced = attr.value
          .split(/\s+/)
          .map((token) => idMap.get(token) ?? token)
          .join(" ");
        if (replaced !== attr.value) element.setAttribute(attr.name, replaced);
        continue;
      }
      if (attr.value.includes("url(")) {
        const replaced = attr.value.replace(urlPattern, (_match, id: string) => `url(#${idMap.get(id) ?? id})`);
        if (replaced !== attr.value) element.setAttribute(attr.name, replaced);
      }
    }
  }
}

/**
 * Parses a rendered diagram SVG into a live `SVGSVGElement` safe for mounting in the document: removes `@import`
 * stylesheet rules, scopes every internal ID to `idPrefix`, sets `role="img"` with accessible naming/description,
 * and configures inline or zoom-stage sizing.
 */
export function prepareDiagramSvg(
  svg: string,
  ownerDocument: Document,
  options: IPrepareDiagramSvgOptions,
): SVGSVGElement {
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = parsed.documentElement;
  if (root.localName !== "svg") throw new Error("Diagram returned an invalid SVG document.");

  stripImportRules(root, ownerDocument);
  prefixSvgIds(root, options.idPrefix);

  const imported = ownerDocument.importNode(root, true);
  if (!(imported instanceof SVGSVGElement)) throw new Error("Diagram SVG could not be imported.");

  imported.setAttribute("role", "img");
  imported.removeAttribute("aria-roledescription");
  if (options.labelledBy) {
    imported.setAttribute("aria-labelledby", options.labelledBy);
    imported.removeAttribute("aria-label");
  } else if (options.label) {
    imported.setAttribute("aria-label", options.label);
    imported.removeAttribute("aria-labelledby");
  }
  if (options.describedBy) imported.setAttribute("aria-describedby", options.describedBy);
  else imported.removeAttribute("aria-describedby");

  const size = parseViewBox(imported.getAttribute("viewBox")) ?? {
    width: parseLength(imported.getAttribute("width")) ?? 0,
    height: parseLength(imported.getAttribute("height")) ?? 0,
  };
  if (!imported.getAttribute("viewBox") && size.width > 0 && size.height > 0) {
    imported.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
  }

  imported.style.display = "block";
  if (options.fit === "fill") {
    imported.setAttribute("width", "100%");
    imported.setAttribute("height", "100%");
    imported.style.maxWidth = "none";
    imported.style.width = "100%";
    imported.style.height = "100%";
  } else {
    imported.removeAttribute("height");
    imported.style.maxWidth = "100%";
    imported.style.height = "auto";
    imported.style.marginInline = "auto";
  }

  return imported;
}

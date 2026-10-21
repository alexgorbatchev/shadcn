export function prepareMermaidSvg(svg: string, ownerDocument: Document): SVGSVGElement {
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = parsed.documentElement;
  if (!(root instanceof SVGSVGElement)) throw new Error("Mermaid returned an invalid SVG document.");
  const detached = ownerDocument.implementation.createHTMLDocument();
  for (const source of root.querySelectorAll("style")) {
    // An inert document has no browsing context: parse CSS before connecting it
    // to the displayed diagram, so @import cannot start a remote font request.
    const style = detached.createElement("style");
    style.textContent = source.textContent;
    detached.head.append(style);
    const sheet = style.sheet;
    if (!sheet) throw new Error("The browser could not parse Mermaid's stylesheet.");
    for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
      if (sheet.cssRules[index] instanceof CSSImportRule) sheet.deleteRule(index);
    }
    source.textContent = Array.from(sheet.cssRules, (rule) => rule.cssText).join("\n");
    style.remove();
  }
  return ownerDocument.importNode(root, true);
}

import { useCallback, useLayoutEffect, useState, type JSX } from "react";
import { cn } from "../../../utils/cn.js";
import { prepareMermaidSvg } from "../utils/prepareMermaidSvg.js";

interface IMermaidSvgProps {
  svg: string;
  isExpanded?: boolean;
}

export function MermaidSvg({ svg, isExpanded = false }: IMermaidSvgProps): JSX.Element {
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const attach = useCallback((host: HTMLDivElement | null) => {
    if (host) setRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);
  useLayoutEffect(() => {
    if (!root) return;
    const layout = new CSSStyleSheet();
    layout.replaceSync(
      `svg { display: block; max-width: 100%; height: auto; margin-inline: auto; ${isExpanded ? "max-height: 80dvh;" : ""} }`,
    );
    root.adoptedStyleSheets = [layout];
    // This is a native SVG renderer integration. Shadow DOM scopes the complete
    // maintained stylesheet and fragment IDs without rewriting its selectors.
    root.replaceChildren(prepareMermaidSvg(svg, root.ownerDocument));
    return () => {
      root.replaceChildren();
      root.adoptedStyleSheets = [];
    };
  }, [root, svg, isExpanded]);
  return (
    <div
      data-testid="MermaidSvg"
      ref={attach}
      className={cn(isExpanded ? "flex h-full w-full items-center justify-center" : "overflow-x-auto p-panel")}
    />
  );
}

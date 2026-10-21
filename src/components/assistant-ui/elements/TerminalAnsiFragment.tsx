import { useLayoutEffect, useRef, useState, type JSX } from "react";
import type { ITerminalFragment } from "../utils/parseTerminalLine.js";
import { readTerminalBackground } from "../utils/readTerminalBackground.js";
import { readableTerminalForeground } from "../utils/readableTerminalForeground.js";

interface ITerminalAnsiFragmentProps {
  fragment: ITerminalFragment;
}

export function TerminalAnsiFragment({ fragment }: ITerminalAnsiFragmentProps): JSX.Element {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [readableForeground, setReadableForeground] = useState<string>();
  const foreground = fragment.isReverse ? fragment.backgroundColor : fragment.foregroundColor;
  const background = fragment.isReverse ? fragment.foregroundColor : fragment.backgroundColor;
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (!foreground && !background && !fragment.isDim) {
      setReadableForeground(undefined);
      return;
    }
    const measure = () => {
      const surface = readTerminalBackground(element);
      const color = foreground ?? getComputedStyle(element.parentElement ?? element).color;
      setReadableForeground(
        surface ? readableTerminalForeground(color, surface, fragment.isDim) : (foreground ?? undefined),
      );
    };
    measure();
    // Parent layout effects can commit a theme after descendant layout effects.
    // Observe the actual theme root so measurement follows committed CSS.
    const observer = new MutationObserver(measure);
    observer.observe(element.ownerDocument.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const root = element.getRootNode();
    if (root instanceof ShadowRoot)
      observer.observe(root.host, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    return () => observer.disconnect();
  }, [foreground, background, fragment.isDim]);
  return (
    <span
      ref={elementRef}
      style={{
        color: readableForeground ?? foreground ?? undefined,
        backgroundColor: background ?? undefined,
        fontWeight: fragment.isBold ? 700 : undefined,
        fontStyle: fragment.isItalic ? "italic" : undefined,
        textDecorationLine:
          [fragment.isUnderline ? "underline" : "", fragment.isStrikethrough ? "line-through" : ""]
            .filter(Boolean)
            .join(" ") || undefined,
        visibility: fragment.isHidden ? "hidden" : undefined,
      }}
    >
      {fragment.text}
    </span>
  );
}

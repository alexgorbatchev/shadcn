import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../theme/ThemeContext.js";
import { getMermaidThemeConfig, type IMermaidThemeConfig } from "../mermaidTheme.js";

export interface IMermaidThemeState {
  /** Stable fingerprint that changes whenever the resolved Mermaid palette or font changes. */
  themeKey: string;
  config: IMermaidThemeConfig;
}

function readThemeState(element?: Element): IMermaidThemeState {
  const config = getMermaidThemeConfig(element);
  return { themeKey: JSON.stringify(config), config };
}

/**
 * Tracks the active library theme and system appearance and returns updated Mermaid theme configuration whenever
 * appearance, theme preset, or root styling changes so open diagrams redraw without a reload.
 */
export function useMermaidTheme(element?: Element | null): IMermaidThemeState {
  const theme = useContext(ThemeContext);
  const resolvedTheme = theme?.resolvedTheme;
  const preset = theme?.preset;
  const [state, setState] = useState<IMermaidThemeState>(() => readThemeState(element ?? undefined));

  useEffect(() => {
    const target = element ?? undefined;
    const sync = (): void => {
      const next = readThemeState(target);
      setState((current) => (current.themeKey === next.themeKey ? current : next));
    };
    sync();

    const observer =
      typeof MutationObserver !== "undefined" && typeof document !== "undefined"
        ? new MutationObserver(sync)
        : undefined;
    if (observer && typeof document !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-theme-preset", "class", "style"],
      });
      const scoped = target?.closest("[data-theme]");
      if (scoped && scoped !== document.documentElement) {
        observer.observe(scoped, {
          attributes: true,
          attributeFilter: ["data-theme", "data-theme-preset", "class", "style"],
        });
      }
    }

    const media =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : undefined;
    media?.addEventListener("change", sync);
    return () => {
      observer?.disconnect();
      media?.removeEventListener("change", sync);
    };
  }, [element, resolvedTheme, preset]);

  return state;
}

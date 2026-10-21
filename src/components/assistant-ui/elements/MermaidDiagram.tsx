import { useMemo, type JSX } from "react";
import { renderMermaidSVG } from "beautiful-mermaid";
import { Skeleton } from "../../Skeleton.js";
import { MermaidSvg } from "./MermaidSvg.js";
import { MermaidZoom } from "./MermaidZoom.js";

export interface IMermaidDiagramProps {
  code: string;
  streaming?: boolean;
}

export function MermaidDiagram({ code, streaming = false }: IMermaidDiagramProps): JSX.Element {
  const svg = useMemo(() => {
    if (streaming) return undefined;
    try {
      const rendered = renderMermaidSVG(code, {
        bg: "var(--background)",
        fg: "var(--foreground)",
        muted: "var(--muted-foreground)",
        border: "var(--border)",
        accent: "var(--primary)",
        surface: "var(--secondary)",
        font: "JetBrains Mono Variable",
        transparent: true,
      });
      const lines = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("%%"));
      const hasDanglingLink =
        /^(?:graph|flowchart)\b/i.test(lines[0] ?? "") &&
        lines.slice(1).some((line) => /(?:--|==|-\.|~~)[-.=~]*[>ox]?\s*(?:\|[^|]*\|)?$/.test(line));
      return /^<svg\b[^>]*\swidth="0"/.test(rendered) || hasDanglingLink ? null : rendered;
    } catch {
      return null;
    }
  }, [code, streaming]);
  if (svg === undefined)
    return (
      <div data-testid="MermaidDiagram" role="status" aria-label="Rendering diagram">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (svg === null)
    return (
      <div data-testid="MermaidDiagram" className="rounded-sm border border-border bg-muted">
        <pre className="overflow-x-auto p-panel text-sm">
          <code>{code.trim()}</code>
        </pre>
        <p className="border-t border-border px-panel py-control-y text-sm text-muted-foreground">
          diagram could not be rendered
        </p>
      </div>
    );
  return (
    <div data-testid="MermaidDiagram" className="rounded-sm border border-border bg-card">
      <MermaidZoom svg={svg}>
        <MermaidSvg svg={svg} />
      </MermaidZoom>
    </div>
  );
}

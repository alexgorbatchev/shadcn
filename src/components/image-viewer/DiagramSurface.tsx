import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useId, useRef, type ReactElement, type Ref } from "react";
import { cn } from "../../utils/cn.js";
import { prepareDiagramSvg } from "./prepareDiagramSvg.js";

export interface IDiagramSurfaceProps {
  /** Rendered SVG markup for the diagram. */
  svg: string;
  /** Accessible name for the live `<svg role="img">`. */
  label: string;
  /** Optional ID of an external visible caption labelling the diagram. */
  labelledBy?: string;
  /** Optional ID of an external element describing the diagram. */
  describedBy?: string;
  /** Plain-language text alternative attached via `aria-describedby` when `describedBy` is not supplied. */
  description?: string;
  /** `inline` fits responsively on the card surface; `fill` scales to the parent zoom stage. */
  fit?: "inline" | "fill";
  /** Receives the mounted live `<svg>` element, for example to measure its rendered width before opening full screen. */
  svgRef?: Ref<SVGSVGElement | null>;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T): void {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

/**
 * Mounts a live, theme-matched diagram `<svg>` on the card surface with scoped internal IDs so multiple copies
 * (inline and full screen) coexist safely while keeping `role="img"`, accessible naming, and live vector text.
 */
export function DiagramSurface({
  svg,
  label,
  labelledBy,
  describedBy,
  description,
  fit = "inline",
  svgRef,
}: IDiagramSurfaceProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const descriptionId = `diagram-desc-${rawId}`;
  const effectiveDescribedBy = describedBy ?? (description?.trim() ? descriptionId : undefined);

  useIsoLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const element = prepareDiagramSvg(svg, host.ownerDocument, {
      idPrefix: `diagram-${rawId}`,
      label,
      labelledBy,
      describedBy: effectiveDescribedBy,
      fit,
    });
    host.replaceChildren(element);
    assignRef(svgRef, element);
    return () => {
      assignRef(svgRef, null);
      host.replaceChildren();
    };
  }, [svg, rawId, label, labelledBy, effectiveDescribedBy, fit, svgRef]);

  return (
    <div
      data-slot="diagram-surface"
      data-fit={fit}
      className={cn("bg-card text-card-foreground", fit === "fill" ? "size-full" : "overflow-x-auto p-panel-sm")}
    >
      <div ref={hostRef} className={fit === "fill" ? "size-full" : undefined} />
      {!describedBy && description?.trim() ? (
        <span id={descriptionId} className="sr-only">
          {description.trim()}
        </span>
      ) : null}
    </div>
  );
}

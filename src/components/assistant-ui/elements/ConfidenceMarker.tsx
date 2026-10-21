import type { JSX } from "react";
import { useId } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { floating } from "./constants.js";
import { mono } from "./constants.js";
export type Confidence = "grounded" | "inferred" | "uncertain";
export interface IConfidenceClaim {
  id: string;
  text: string;
  confidence: Confidence;
  basis: string;
}
const UNDERLINE: Record<Confidence, string> = {
  grounded: "decoration-success/50",
  inferred: "decoration-warning/60",
  uncertain: "decoration-destructive/50 decoration-dotted",
};
const LABEL: Record<Confidence, string> = {
  grounded: "from a source",
  inferred: "inferred",
  uncertain: "unverified",
};
export function ConfidenceMarker({ claims, hoveredId, onHover, ...props }: IConfidenceMarkerProps): JSX.Element {
  const basisId = useId();
  const hovered = claims.find((claim) => claim.id === hoveredId);
  return (
    <div
      data-testid="ConfidenceMarker"
      data-slot="confidence-marker"
      className="flex w-full max-w-sm flex-col gap-2"
      {...props}
    >
      <p className="text-base leading-relaxed">
        {claims.map((claim) => (
          <button
            key={claim.id}
            type="button"
            aria-describedby={hoveredId === claim.id ? basisId : undefined}
            onMouseEnter={() => onHover?.(claim.id)}
            onMouseLeave={() => onHover?.("")}
            onFocus={() => onHover?.(claim.id)}
            onBlur={() => onHover?.("")}
            className={cn(
              "focus-visible:ring-foreground/20 inline cursor-help rounded text-start underline decoration-2 underline-offset-[3px] transition-colors outline-none focus-visible:ring-1",
              UNDERLINE[claim.confidence],
              hoveredId === claim.id ? "text-foreground/95" : "text-foreground/70",
            )}
          >
            {claim.text}{" "}
          </button>
        ))}
      </p>

      <div className="flex h-9 items-start">
        {hovered && (
          <span
            id={basisId}
            role="status"
            className={cn(
              floating,
              mono,
              "fade-in animate-in text-muted-foreground flex items-center gap-1.5 rounded-full px-2.5 py-1.5 duration-150",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                hovered.confidence === "grounded" && "bg-success",
                hovered.confidence === "inferred" && "bg-warning",
                hovered.confidence === "uncertain" && "bg-destructive",
              )}
            />
            {LABEL[hovered.confidence]} · {hovered.basis}
          </span>
        )}
      </div>
    </div>
  );
}
interface IConfidenceMarkerProps extends Omit<
  ComponentProps<"div">,
  "children" | "claims" | "hoveredId" | "onHover" | "className" | "style"
> {
  claims: readonly IConfidenceClaim[];
  hoveredId: string;
  onHover?: (id: string) => void;
}

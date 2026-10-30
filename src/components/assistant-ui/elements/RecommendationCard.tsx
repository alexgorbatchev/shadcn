import { Button } from "../../Button.js";
import type { ComponentProps, JSX, ReactNode } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";
type RecommendationCardProps = Omit<ComponentProps<"div">, "children"> & {
  state: RecommendationState;
  question: string;
  children: ReactNode;
  /** Confidence text beside the indicator; omit it to hide the indicator. */
  confidenceLabel?: string;
  acceptedLabel: string;
  /** Receipt shown in the `rejected` state. */
  rejectedLabel?: string;
  /** Each action renders only when its handler is supplied. */
  onAccept?: () => void;
  onAlternatives?: () => void;
  onReject?: () => void;
  acceptLabel?: string;
  alternativesLabel?: string;
  rejectLabel?: string;
  /** Span the container's width instead of the compact card width. */
  fullWidth?: boolean;
};
export type RecommendationState = "idle" | "accepted" | "rejected";
const CONFIDENCE_BARS = [0, 1, 2];
export function RecommendationCard({
  state,
  question,
  children,
  confidenceLabel,
  acceptedLabel,
  rejectedLabel = "Dismissed",
  onAccept,
  onAlternatives,
  onReject,
  acceptLabel = "Accept",
  alternativesLabel = "Alternatives",
  rejectLabel = "Not this",
  fullWidth = false,
  className,
  ...props
}: RecommendationCardProps): JSX.Element {
  const { receiptRef, focusHandlers } = useReceiptFocus<HTMLDivElement>(props);
  return (
    <div
      data-testid="RecommendationCard"
      data-slot="recommendation-card"
      data-scroll="none"
      className={cn(cn(paper, "flex w-full flex-col gap-3 rounded-md p-4", !fullWidth && "max-w-sm"), className)}
      {...props}
      {...focusHandlers}
    >
      <p className="text-sm font-medium">{question}</p>
      <div className="text-muted-foreground text-base leading-relaxed">{children}</div>

      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        {state === "idle" ? (
          <>
            {confidenceLabel !== undefined && (
              <div className="flex items-center gap-2">
                <span className="flex items-end gap-0.5" aria-hidden>
                  {CONFIDENCE_BARS.map((bar) => (
                    <span key={bar} className="w-1 rounded-full bg-success/70" style={{ height: 6 + bar * 3 }} />
                  ))}
                </span>
                <span className={cn(mono, "text-muted-foreground")}>{confidenceLabel}</span>
              </div>
            )}
            <div className="ms-auto flex flex-wrap items-center gap-2">
              {onReject && (
                <Button type="button" onClick={onReject} variant="ghost">
                  {rejectLabel}
                </Button>
              )}
              {onAlternatives && (
                <Button type="button" onClick={onAlternatives} variant="ghost">
                  {alternativesLabel}
                </Button>
              )}
              {onAccept && (
                <Button type="button" onClick={onAccept} variant="default">
                  {acceptLabel}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div
            key={state}
            ref={receiptRef}
            tabIndex={-1}
            className="fade-in animate-in text-muted-foreground flex items-center gap-2 text-sm duration-300"
          >
            {state === "accepted" ? (
              <CheckIcon aria-hidden="true" className={cn("size-4")} />
            ) : (
              <XIcon aria-hidden="true" className={cn("size-4")} />
            )}
            {state === "accepted" ? acceptedLabel : rejectedLabel}
          </div>
        )}
      </div>
    </div>
  );
}

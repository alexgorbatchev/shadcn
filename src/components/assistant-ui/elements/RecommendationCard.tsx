import { Button } from "../../Button.js";
import type { JSX } from "react";
type RecommendationCardProps = Omit<
  ComponentProps<"div">,
  "state" | "question" | "children" | "confidenceLabel" | "acceptedLabel" | "onAccept" | "onAlternatives"
> & {
  state: RecommendationState;
  question: string;
  children: ReactNode;
  confidenceLabel: string;
  acceptedLabel: string;
  onAccept?: () => void;
  onAlternatives?: () => void;
};
import type { ComponentProps } from "react";
import type { ReactNode } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";
export type RecommendationState = "idle" | "accepted";
const CONFIDENCE_BARS = [0, 1, 2];
export function RecommendationCard({
  state,
  question,
  children,
  confidenceLabel,
  acceptedLabel,
  onAccept,
  onAlternatives,
  className,
  ...props
}: RecommendationCardProps): JSX.Element {
  const { receiptRef, focusHandlers } = useReceiptFocus<HTMLDivElement>(props);
  return (
    <div
      data-testid="RecommendationCard"
      data-slot="recommendation-card"
      data-scroll="none"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-4"), className)}
      {...props}
      {...focusHandlers}
    >
      <p className="text-sm font-medium">{question}</p>
      <p className="text-muted-foreground text-base leading-relaxed">{children}</p>

      <div className="flex h-8 items-center justify-between">
        {state === "idle" ? (
          <>
            <div className="flex items-center gap-2">
              <span className="flex items-end gap-0.5" aria-hidden>
                {CONFIDENCE_BARS.map((bar) => (
                  <span key={bar} className="w-1 rounded-full bg-success/70" style={{ height: 6 + bar * 3 }} />
                ))}
              </span>
              <span className={cn(mono, "text-muted-foreground")}>{confidenceLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={onAlternatives} variant="ghost">
                Alternatives
              </Button>
              <Button type="button" onClick={onAccept} variant="default">
                Accept
              </Button>
            </div>
          </>
        ) : (
          <div
            key="accepted"
            ref={receiptRef}
            tabIndex={-1}
            className="fade-in animate-in text-muted-foreground flex items-center gap-2 text-sm duration-300"
          >
            <CheckIcon aria-hidden="true" className={cn("size-4")} />
            {acceptedLabel}
          </div>
        )}
      </div>
    </div>
  );
}

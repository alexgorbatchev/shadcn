import type { ReactElement } from "react";
import { useContextDisplay } from "../hooks/useContextDisplay.js";
import { getStrokeColor } from "../utils/contextUsage.js";
import { formatTokenCount } from "../utils/tokens.js";
import { ShareMeter } from "./ShareMeter.js";

interface IContextDisplayValueProps {
  variant: "ring" | "bar" | "text";
}

export function ContextDisplayValue({ variant }: IContextDisplayValueProps): ReactElement {
  const { percent, totalTokens, modelContextWindow } = useContextDisplay();
  if (variant === "text")
    return (
      <span data-testid="ContextDisplayValue" className="font-mono tabular-nums">
        {formatTokenCount(totalTokens)} / {formatTokenCount(modelContextWindow)}
      </span>
    );
  if (variant === "bar")
    return (
      <span data-testid="ContextDisplayValue" className="flex items-center gap-1.5">
        <ShareMeter label="Context window used" percentage={percent} size="compact" />
        <span className="tabular-nums">
          {formatTokenCount(totalTokens)} ({Math.round(percent)}%)
        </span>
      </span>
    );
  return (
    <span data-testid="ContextDisplayValue" className="flex items-center gap-1.5">
      <svg aria-hidden="true" width={18} height={18} viewBox="0 0 18 18" className="-rotate-90">
        <circle cx={9} cy={9} r={7.75} fill="none" strokeWidth={2.5} className="stroke-border" />
        <circle
          cx={9}
          cy={9}
          r={7.75}
          pathLength={100}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={100}
          strokeDashoffset={100 - percent}
          className={getStrokeColor(percent)}
        />
      </svg>
      <span className="font-mono tabular-nums">{Math.round(percent)}%</span>
    </span>
  );
}

import type { ComponentProps, ReactElement } from "react";
import { PopoverContent, PopoverTitle } from "../../Popover.js";
import { useContextDisplay } from "../hooks/useContextDisplay.js";
import { getContextSegments, getPercentColor } from "../utils/contextUsage.js";
import { formatTokenCount } from "../utils/tokens.js";
import { ShareMeter } from "./ShareMeter.js";

export interface IContextDisplayContentProps {
  side?: ComponentProps<typeof PopoverContent>["side"];
}

export function ContextDisplayContent({ side = "top" }: IContextDisplayContentProps): ReactElement {
  const { usage, totalTokens, percent, modelContextWindow } = useContextDisplay();
  const segments = getContextSegments(usage);
  return (
    <PopoverContent side={side} sideOffset={8} data-slot="context-display-popover">
      <PopoverTitle>Context usage</PopoverTitle>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-baseline justify-between gap-4 whitespace-nowrap">
          <span className={getPercentColor(percent)}>{Math.round(percent)}% full</span>
          <span className="font-mono tabular-nums">
            {formatTokenCount(totalTokens)} / {formatTokenCount(modelContextWindow)}
          </span>
        </div>
        <ShareMeter
          label="Context window used"
          percentage={percent}
          tone={percent > 85 ? "destructive" : percent >= 65 ? "warning" : "primary"}
        />
        {segments.length > 0 && (
          <div className="grid gap-1">
            {segments.map((segment) => (
              <div key={segment.label} className="flex items-baseline justify-between gap-4">
                <span className="text-muted-foreground">{segment.label}</span>
                <span className="font-mono tabular-nums">{formatTokenCount(segment.tokens)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PopoverContent>
  );
}

import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { collapsePanel } from "./constants.js";
import type { JSX } from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { Collapsible } from "../../Collapsible.js";
import { CollapsibleContent } from "../../Collapsible.js";
import { CollapsibleTrigger } from "../../Collapsible.js";
import { field, mono } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
import { SwapLabel } from "./SwapLabel.js";
export interface IToolCallProps {
  label: string;
  activeLabel: string;
  query: string;
  request: string;
  result: string;
  running: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function ToolCall({
  label,
  activeLabel,
  query,
  request,
  result,
  running,
  open,
  onOpenChange,
}: IToolCallProps): JSX.Element {
  return (
    <Collapsible
      data-testid="ToolCall"
      data-slot="tool-call"
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      render={<div className={cn("w-full max-w-sm")} />}
    >
      <CollapsibleTrigger
        render={
          <AnalyticsButton
            component="ToolCall"
            type="button"
            className="group/trigger text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-md py-1 text-[13.5px] transition-colors outline-none"
          />
        }
      >
        <ChevronRightIcon aria-hidden="true" className={cn("size-4")} />
        <SwapLabel active={running ? 0 : 1}>
          <ShimmerLabel active={running}>{activeLabel}</ShimmerLabel>
          <>{label}</>
        </SwapLabel>
        <span
          className={cn(mono, "bg-foreground/[0.06] text-muted-foreground min-w-0 truncate rounded-md px-1.5 py-0.5")}
        >
          {query}
        </span>
        <span className="ms-auto flex w-4 shrink-0 items-center justify-end">
          {!running && <CheckIcon aria-hidden="true" className={cn("size-4")} />}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent render={<div className={cn(collapsePanel, "outline-none")} />}>
        <div className={cn(field, "mt-2 overflow-hidden rounded-md text-sm")}>
          <div className="px-3.5 pt-2.5 pb-2">
            <p className={cn(mono, "text-muted-foreground mb-1")}>Request</p>
            <p className="text-muted-foreground font-mono break-words">{request}</p>
          </div>
          <div className="bg-foreground/[0.06] mx-3.5 h-px" />
          <div className="px-3.5 pt-2 pb-2.5">
            <p className={cn(mono, "text-muted-foreground mb-1")}>Result</p>
            <p className="text-foreground break-words">{result}</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

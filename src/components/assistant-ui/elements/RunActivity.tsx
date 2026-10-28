import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { collapsePanel } from "./constants.js";
import type { JSX } from "react";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { Collapsible } from "../../Collapsible.js";
import { CollapsibleContent } from "../../Collapsible.js";
import { CollapsibleTrigger } from "../../Collapsible.js";
export type RunActivityStatus = "running" | "requires-action" | "complete" | "cancelled" | "incomplete" | "error";
export type RunActivityEntry = {
  id: string;
  kind: "commentary" | "tool";
  label: string;
  content: ReactNode;
};
export type RunActivityProps = {
  status: RunActivityStatus;
  statusLabel: string;
  /** Formatted from the caller's persisted run timing. */
  durationLabel?: ReactNode;
  entries: readonly RunActivityEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pending decisions and recovery controls remain outside the disclosure. */
  attention?: ReactNode;
  /** Final-answer content remains outside the disclosure. */
  children?: ReactNode;
};
export function RunActivity({
  status,
  statusLabel,
  durationLabel,
  entries,
  open,
  onOpenChange,
  attention,
  children,
}: RunActivityProps): JSX.Element {
  const latestActivity = status === "running" ? entries.findLast((entry) => entry.label.trim())?.label : undefined;
  const summary = (
    <span className="text-start tabular-nums">
      {statusLabel}
      {durationLabel !== null && durationLabel !== undefined && <> {durationLabel}</>}
    </span>
  );
  return (
    <div
      data-testid="RunActivity"
      data-slot="run-activity"
      data-status={status}
      className={cn("flex min-w-0 flex-col gap-3")}
    >
      {entries.length > 0 ? (
        <Collapsible open={open} onOpenChange={(next) => onOpenChange(next)}>
          <CollapsibleTrigger
            aria-busy={status === "running"}
            render={
              <AnalyticsButton
                component="RunActivity"
                type="button"
                className="group/trigger text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex max-w-full items-center gap-1.5 rounded-md py-1 text-sm outline-none focus-visible:ring-[3px]"
              />
            }
          >
            <ChevronRightIcon aria-hidden="true" className={cn("size-4")} />
            {summary}
          </CollapsibleTrigger>
          <CollapsibleContent render={<div className={cn(collapsePanel, "peer")} />}>
            <ol className="border-border ms-1.5 flex min-w-0 flex-col gap-3 border-s ps-3.5 pt-2 text-sm wrap-anywhere">
              {entries.map((entry) => (
                <li key={entry.id} data-activity-kind={entry.kind}>
                  {entry.content}
                </li>
              ))}
            </ol>
          </CollapsibleContent>
          {!open && latestActivity && (
            // The panel stays mounted during its exit transition.
            <p className="text-muted-foreground ps-5 text-sm wrap-anywhere peer-[:not([hidden])]:hidden">
              {latestActivity}
            </p>
          )}
        </Collapsible>
      ) : (
        <p className="text-muted-foreground py-1 text-sm">{summary}</p>
      )}
      {/* Announce the settled duration without announcing streaming timer ticks. */}
      <span role="status" aria-atomic="true" className="sr-only">
        {statusLabel}
        {status !== "running" && durationLabel !== null && durationLabel !== undefined && <> {durationLabel}</>}
      </span>
      {attention}
      {children}
    </div>
  );
}

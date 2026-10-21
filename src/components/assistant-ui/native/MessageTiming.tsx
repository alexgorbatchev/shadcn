import { type ReactElement } from "react";
import { useMessageTiming } from "@assistant-ui/react";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../../Popover.js";
import { cn } from "../../../utils/cn.js";

const formatTimingMs = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};
/**
 * Shows streaming stats (TTFT, total time, tok/s, chunks) as a badge with a
 * keyboard-accessible popover. Renders nothing until the stream completes.
 *
 * Place it inside `ActionBarPrimitive.Root` in your `thread.tsx` so it
 * inherits the action bar's autohide behaviour:
 *
 * ```tsx
 * import { MessageTiming } from "./MessageTiming.js";
 *
 * <ActionBarPrimitive.Root >
 *   <ActionBarPrimitive.Copy />
 *   <ActionBarPrimitive.Reload />
 *   <MessageTiming />  // <-- add this
 * </ActionBarPrimitive.Root>
 * ```
 *
 * @param side - Side of the popover relative to the badge trigger.
 * @default "right"
 */
export function MessageTiming({
  className,
  side = "right",
}: {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}): ReactElement | null {
  const timing = useMessageTiming();
  if (timing?.totalStreamTime === undefined) return null;
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        render={
          <button
            type="button"
            data-slot="message-timing-trigger"
            aria-label="Message timing"
            className={cn(
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-control-sm items-center rounded-sm px-control-x font-mono text-sm tabular-nums transition-colors",
              className,
            )}
          />
        }
      >
        {formatTimingMs(timing.totalStreamTime)}
      </PopoverTrigger>
      <PopoverContent side={side} sideOffset={8} data-slot="message-timing-popover">
        <PopoverTitle>Message timing</PopoverTitle>
        <div className="grid min-w-35 gap-1.5 text-sm">
          {timing.firstTokenTime !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">First token</span>
              <span className="font-mono tabular-nums">{formatTimingMs(timing.firstTokenTime)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Total</span>
            <span className="font-mono tabular-nums">{formatTimingMs(timing.totalStreamTime)}</span>
          </div>
          {timing.tokensPerSecond !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Speed</span>
              <span className="font-mono tabular-nums">{timing.tokensPerSecond.toFixed(1)} tok/s</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Chunks</span>
            <span className="font-mono tabular-nums">{timing.totalChunks}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

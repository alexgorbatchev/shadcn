import type { JSX } from "react";
import type { ComponentProps, ReactNode } from "react";
import { CheckIcon, PauseIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export type AgentState = "working" | "waiting" | "done" | "failed";
export function AgentStatus({
  state,
  label,
  elapsed,
  endEnhancer,
  className,
  ...props
}: IAgentStatusProps): JSX.Element {
  return (
    <output
      data-testid="AgentStatus"
      data-slot="agent-status"
      className={cn(paper, "flex items-center gap-2.5 rounded-full py-1.5 ps-3.5 pe-1.5", className)}
      {...props}
    >
      {state === "done" ? (
        <CheckIcon aria-hidden="true" className={cn("size-3.5", "text-success")} />
      ) : state === "failed" ? (
        <XIcon aria-hidden="true" className={cn("size-3.5", "text-destructive")} />
      ) : (
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full motion-reduce:animate-none",
            state === "working" ? "animate-pulse bg-primary" : "border-foreground/35 border",
          )}
        />
      )}
      <span className="sr-only">{state}</span>
      <span
        key={label}
        className="fade-in blur-in-[2px] animate-in max-w-44 truncate text-sm duration-300 motion-reduce:animate-none"
      >
        {label}
      </span>
      {elapsed !== undefined && state !== "done" && state !== "failed" && (
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>{elapsed}</span>
      )}
      <span
        aria-hidden
        data-slot="agent-status-end-enhancer"
        className="text-muted-foreground flex size-6 items-center justify-center rounded-full"
      >
        {endEnhancer !== undefined ? (
          endEnhancer
        ) : state === "done" || state === "failed" ? (
          <RotateCcwIcon aria-hidden="true" className={cn("size-3.5")} />
        ) : (
          <PauseIcon aria-hidden="true" className={cn("size-3.5")} />
        )}
      </span>
    </output>
  );
}
interface IAgentStatusProps extends Omit<ComponentProps<"output">, "children" | "state" | "label" | "elapsed"> {
  state: AgentState;
  label: string;
  elapsed?: string | undefined;
  endEnhancer?: ReactNode | undefined;
}

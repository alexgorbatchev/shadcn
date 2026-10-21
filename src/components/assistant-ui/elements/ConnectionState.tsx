import { cn } from "../../../utils/cn.js";
import type { ComponentProps, JSX } from "react";
import { CheckIcon, CloudOffIcon, Loader2Icon } from "lucide-react";
import { Button } from "../../Button.js";
export type ConnectionPhase = "online" | "dropped" | "reconnecting" | "resumed";
interface IConnectionStateProps extends Omit<ComponentProps<"div">, "children" | "className" | "style" | "role"> {
  phase: ConnectionPhase;
  attempt?: number;
  resumedTokens?: number;
  onRetry?: () => void;
}
export function ConnectionState({
  phase,
  attempt,
  resumedTokens,
  onRetry,
  ...props
}: IConnectionStateProps): JSX.Element | null {
  if (phase === "online") return null;
  return (
    <div
      {...props}
      role="status"
      data-testid="ConnectionState"
      data-slot="connection-state"
      className="flex w-full max-w-sm items-center gap-2 rounded-md border border-frame-edge bg-card p-2 text-sm text-card-foreground shadow-frame"
    >
      {phase === "dropped" ? (
        <>
          <CloudOffIcon aria-hidden="true" className={cn("size-4")} />
          <span className="min-w-0 flex-1">Connection lost. The run kept going on the server.</span>
          <Button variant="ghost" onClick={onRetry} disabled={!onRetry}>
            Reconnect
          </Button>
        </>
      ) : null}
      {phase === "reconnecting" ? (
        <>
          <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
          <span className="min-w-0 flex-1">Reconnecting</span>
          {attempt !== undefined ? (
            <span className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">attempt {attempt}</span>
          ) : null}
        </>
      ) : null}
      {phase === "resumed" ? (
        <>
          <CheckIcon aria-hidden="true" className={cn("size-4", "text-success")} />
          <span className="min-w-0 flex-1">Picked the stream back up.</span>
          {resumedTokens !== undefined ? (
            <span className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
              +{resumedTokens} tokens
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

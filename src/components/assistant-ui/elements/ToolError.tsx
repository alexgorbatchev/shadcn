import { Button } from "../../Button.js";
import type { JSX } from "react";
type ToolErrorProps = Omit<
  ComponentProps<"div">,
  "children" | "name" | "target" | "message" | "attempt" | "maxAttempts" | "retrying" | "onRetry" | "onSkip"
> & {
  name: string;
  target: string;
  message: string;
  attempt: number;
  maxAttempts: number;
  retrying: boolean;
  onRetry?: () => void;
  onSkip?: () => void;
};
import type { ComponentProps } from "react";
import { AlertCircleIcon, Loader2Icon, RotateCwIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
export function ToolError({
  name,
  target,
  message,
  attempt,
  maxAttempts,
  retrying,
  onRetry,
  onSkip,
  className,
  ...props
}: ToolErrorProps): JSX.Element {
  return (
    <div
      data-testid="ToolError"
      data-slot="tool-error"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-3.5"), className)}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircleIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
        <span className={cn(mono, "text-muted-foreground min-w-0 wrap-anywhere")}>{name}</span>
        <span className="text-foreground min-w-0 flex-1 truncate text-base">{target}</span>
        <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
          {attempt}/{maxAttempts}
        </span>
      </div>

      <div
        className={cn(
          field,
          "rounded-md px-3 py-2 font-mono text-[11px] leading-relaxed break-words text-destructive text-destructive",
        )}
      >
        {message}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" onClick={onSkip} disabled={!onSkip} variant="ghost">
          Skip
        </Button>
        <Button type="button" onClick={onRetry} disabled={retrying} variant="ghost">
          {retrying ? (
            <Loader2Icon
              aria-hidden="true"
              data-icon="inline-start"
              className={cn("animate-spin motion-reduce:animate-none")}
            />
          ) : (
            <RotateCwIcon aria-hidden="true" data-icon="inline-start" />
          )}
          {retrying ? "Retrying" : "Retry"}
        </Button>
      </div>
    </div>
  );
}

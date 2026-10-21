import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { codeScroll } from "./constants.js";
import { codeSurface } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export type RunState = "idle" | "running" | "ok" | "error";
export function CodeRunner({
  language,
  code,
  state,
  output,
  durationMs,
  onRun,
  ...props
}: ICodeRunnerProps): JSX.Element {
  return (
    <div
      data-testid="CodeRunner"
      data-slot="code-runner"
      className={cn(paper, "flex w-full max-w-md flex-col overflow-hidden rounded-md")}
      {...props}
    >
      <div className="flex items-center gap-2 px-3.5 py-2">
        <span className={cn(mono, "text-muted-foreground min-w-0 flex-1")}>{language}</span>
        {durationMs !== undefined && state !== "running" && (
          <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>{durationMs}ms</span>
        )}
        {onRun || state === "running" ? (
          <Button
            type="button"
            aria-label="Run this snippet"
            onClick={onRun}
            disabled={state === "running"}
            variant="ghost"
            size="icon"
          >
            {state === "running" ? (
              <Loader2Icon
                aria-hidden="true"
                data-icon="inline-start"
                className={cn(state === "running" && "animate-spin motion-reduce:animate-none")}
              />
            ) : (
              <PlayIcon aria-hidden="true" data-icon="inline-start" />
            )}
          </Button>
        ) : null}
      </div>

      <pre className="border-foreground/[0.07] overflow-x-auto border-t px-3.5 py-2.5 font-mono text-sm leading-relaxed">
        <code className="text-foreground/75">{code}</code>
      </pre>

      {state !== "idle" && (
        <div
          role="log"
          aria-label="Code output"
          className="border-foreground/[0.07] fade-in animate-in flex flex-col border-t px-3.5 py-2.5 duration-300"
        >
          <span className={cn(mono, "text-muted-foreground pb-1")}>output</span>
          <div className={codeScroll}>
            <div className={cn(codeSurface, "flex flex-col")}>
              {output.map((line, i) => (
                <span
                  key={`${i}-${line}`}
                  className={cn(
                    "fade-in animate-in fill-mode-both font-mono text-sm leading-relaxed whitespace-pre",
                    state === "error" ? "text-destructive text-destructive" : "text-foreground/70",
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
          {state === "running" && (
            <span
              aria-hidden
              className="bg-foreground/40 h-[1em] w-[2px] animate-pulse rounded-full motion-reduce:animate-none"
            />
          )}
        </div>
      )}
    </div>
  );
}
interface ICodeRunnerProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "language" | "code" | "state" | "output" | "durationMs" | "onRun">,
  "className" | "style"
> {
  language: string;
  code: string;
  state: RunState;
  output: readonly string[];
  durationMs?: number;
  onRun?: () => void;
}

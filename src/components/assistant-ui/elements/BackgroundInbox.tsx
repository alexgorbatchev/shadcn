import type { JSX, ComponentProps } from "react";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Card.js";

export type BackgroundState = "running" | "ready" | "failed";
export interface IBackgroundRun {
  id: string;
  title: string;
  state: BackgroundState;
  elapsed: string;
  summary?: string;
}

export function BackgroundInbox({ runs, onCollect, ...props }: IBackgroundInboxProps): JSX.Element {
  const ready = runs.filter((run) => run.state === "ready").length;
  const running = runs.filter((run) => run.state === "running").length;
  return (
    <Card data-testid="BackgroundInbox" className="w-full max-w-sm" {...props}>
      <CardHeader>
        <CardTitle>Running elsewhere</CardTitle>
        <CardDescription>{ready > 0 ? `${ready} ready` : `${running} in flight`}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-control-gap">
        {runs.map((run) => {
          const content = (
            <>
              {run.state === "running" ? (
                <Loader2Icon aria-hidden="true" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />
              ) : run.state === "failed" ? (
                <XIcon aria-hidden="true" className="size-4 shrink-0 text-destructive" />
              ) : (
                <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-success" />
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-control-gap">
                <span className="truncate">{run.title}</span>
                {run.summary && <span className="truncate text-sm text-muted-foreground">{run.summary}</span>}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{run.elapsed}</span>
            </>
          );
          return onCollect ? (
            <Button
              key={run.id}
              fullWidth
              align="start"
              size="content"
              variant="ghost"
              disabled={run.state === "running"}
              onClick={() => onCollect(run.id)}
            >
              {content}
            </Button>
          ) : (
            <div key={run.id} className="flex items-center gap-control-gap py-control-y">
              {content}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface IBackgroundInboxProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  runs: readonly IBackgroundRun[];
  onCollect?: (id: string) => void;
}

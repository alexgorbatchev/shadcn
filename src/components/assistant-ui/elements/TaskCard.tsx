import { TaskStateIcon } from "./TaskStateIcon.js";
import { Button } from "../../Button.js";
import type { JSX } from "react";
type TaskCardProps = Omit<
  ComponentProps<"div">,
  "children" | "label" | "state" | "result" | "open" | "onOpenChange"
> & {
  label: string;
  meta?: string | undefined;
  state: TaskCardState;
  elapsed?: string | undefined;
  actions?: ReactNode | undefined;
  result?: ReactNode | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  children?: ReactNode | undefined;
};
import { Children, type ComponentProps, type ReactNode, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
export type TaskCardState = "working" | "waiting" | "done" | "failed" | "cancelled";
const isRenderable = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== true;
export function TaskCard({
  label,
  meta,
  state,
  elapsed,
  actions,
  result,
  open,
  onOpenChange,
  children,
  className,
  ...props
}: TaskCardProps): JSX.Element {
  const hasTranscript = Children.toArray(children).length > 0;
  const inert = open !== undefined && onOpenChange === undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  return (
    <div
      data-testid="TaskCard"
      data-slot="task-card"
      data-state={state}
      className={cn(paper, "flex w-full max-w-sm flex-col overflow-hidden rounded-md", className)}
      {...props}
    >
      <Button
        type="button"
        aria-expanded={hasTranscript ? isOpen : undefined}
        disabled={!hasTranscript || inert}
        onClick={toggle}
        variant="ghost"
      >
        <TaskStateIcon state={state} />
        <span className="sr-only">{state}</span>
        <span className="min-w-0 flex-1 truncate text-base">{label}</span>
        {meta !== undefined && (
          <span className={cn(mono, "text-muted-foreground max-w-24 shrink-0 truncate")}>{meta}</span>
        )}
        {elapsed !== undefined && (
          <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>{elapsed}</span>
        )}
        {hasTranscript && <ChevronRightIcon aria-hidden="true" data-icon="inline-start" />}
      </Button>
      {isRenderable(actions) && (
        <div data-slot="task-card-actions" className="border-border/60 border-t px-3.5 py-2.5">
          {actions}
        </div>
      )}
      {hasTranscript && isOpen && (
        <div data-slot="task-card-transcript" className="border-border/60 flex flex-col gap-2 border-t px-3.5 py-2.5">
          {children}
        </div>
      )}
      {isRenderable(result) && (
        <div
          data-slot="task-card-result"
          className="border-border/60 text-muted-foreground border-t px-3.5 py-2 text-sm leading-relaxed"
        >
          {result}
        </div>
      )}
    </div>
  );
}

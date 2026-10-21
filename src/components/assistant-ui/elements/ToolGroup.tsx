import { Button } from "../../Button.js";
import type { JSX } from "react";
type ToolGroupProps = Omit<ComponentProps<"div">, "children" | "label" | "tools" | "open" | "onOpenChange"> & {
  label: string;
  tools: readonly IGroupedTool[];
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};
import type { ComponentProps } from "react";
import { CheckIcon, ChevronRightIcon, Loader2Icon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
export type GroupedToolState = "running" | "done" | "failed";
export interface IGroupedTool {
  id: string;
  name: string;
  target: string;
  state: GroupedToolState;
  durationMs?: number;
}
export function ToolGroup({ label, tools, open, onOpenChange, className, ...props }: ToolGroupProps): JSX.Element {
  const running = tools.filter((tool) => tool.state === "running").length;
  const failed = tools.filter((tool) => tool.state === "failed").length;
  const headerClassName = cn(
    "flex items-center gap-2.5 px-3.5 py-2.5 text-start",
    onOpenChange && "hover:bg-foreground/[0.03] transition-colors",
  );
  const header = (
    <>
      <ChevronRightIcon aria-hidden="true" className={cn("size-4")} />
      <span className="min-w-0 flex-1 truncate text-base">{label}</span>
      <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>
        {running > 0
          ? `${tools.length - running}/${tools.length}`
          : failed > 0
            ? `${failed} failed`
            : `${tools.length} done`}
      </span>
      {running > 0 ? (
        <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
      ) : failed > 0 ? (
        <XIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
      ) : (
        <CheckIcon aria-hidden="true" className={cn("size-4")} />
      )}
    </>
  );
  return (
    <div
      data-testid="ToolGroup"
      data-slot="tool-group"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col overflow-hidden rounded-md"), className)}
      {...props}
    >
      {onOpenChange ? (
        <Button type="button" aria-expanded={open} onClick={() => onOpenChange(!open)} variant="ghost">
          {header}
        </Button>
      ) : (
        <div className={headerClassName}>{header}</div>
      )}

      {open && (
        <div className="border-foreground/[0.06] fade-in slide-in-from-top-1 animate-in flex flex-col border-t duration-200">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center gap-2.5 px-3.5 py-2">
              <span className="flex size-3.5 shrink-0 items-center justify-center">
                {tool.state === "running" ? (
                  <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
                ) : tool.state === "failed" ? (
                  <XIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
                ) : (
                  <CheckIcon aria-hidden="true" className={cn("size-4")} />
                )}
              </span>
              <span className={cn(mono, "text-muted-foreground shrink-0")}>{tool.name}</span>
              <span className="text-foreground min-w-0 flex-1 truncate text-base">{tool.target}</span>
              {tool.durationMs !== undefined && (
                <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>{tool.durationMs}ms</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

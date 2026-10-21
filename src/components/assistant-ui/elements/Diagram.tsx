import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { MaximizeIcon, MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export function Diagram({
  title,
  zoom,
  children,
  onZoomIn,
  onZoomOut,
  onReset,
  onExpand,
  ...props
}: IDiagramProps): JSX.Element {
  return (
    <div
      data-testid="Diagram"
      data-slot="diagram"
      className={cn(paper, "flex w-full max-w-md flex-col overflow-hidden rounded-md")}
      {...props}
    >
      <div className="flex items-center gap-1 px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-base font-medium">{title}</span>
        <span className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}>{Math.round(zoom * 100)}%</span>
        <Button
          type="button"
          aria-label="Zoom out"
          onClick={onZoomOut}
          disabled={!onZoomOut}
          variant="ghost"
          size="icon"
        >
          <MinusIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
        <Button type="button" aria-label="Zoom in" onClick={onZoomIn} disabled={!onZoomIn} variant="ghost" size="icon">
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
        <Button
          type="button"
          aria-label="Reset the view"
          onClick={onReset}
          disabled={!onReset}
          variant="ghost"
          size="icon"
        >
          <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
        <Button
          type="button"
          aria-label="Open full screen"
          onClick={onExpand}
          disabled={!onExpand}
          variant="ghost"
          size="icon"
        >
          <MaximizeIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
      </div>

      <div className="border-foreground/[0.07] flex min-h-[160px] items-center justify-center overflow-hidden border-t p-4">
        <div
          className="origin-center transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{ transform: `scale(${zoom})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
interface IDiagramProps extends Omit<
  Omit<ComponentProps<"div">, "title" | "zoom" | "children" | "onZoomIn" | "onZoomOut" | "onReset" | "onExpand">,
  "className" | "style"
> {
  title: string;
  zoom: number;
  children: React.ReactNode;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onExpand?: () => void;
}

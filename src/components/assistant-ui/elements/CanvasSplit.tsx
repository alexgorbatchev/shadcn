import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { CheckIcon, CopyIcon, FileTextIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export function CanvasSplit({ layout = "card", children, ...props }: ICanvasSplitProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplit"
      data-slot="canvas-split"
      data-layout={layout}
      data-scroll="none"
      className={cn(
        "group/canvas-split @container w-full overflow-hidden",
        layout === "card" ? cn(paper, "max-w-3xl rounded-md") : "flex h-full min-h-0 flex-col bg-background",
      )}
      {...props}
    >
      <div
        className={cn("flex flex-col", layout === "card" ? "@xl:h-80 @xl:flex-row" : "min-h-0 flex-1 @3xl:flex-row")}
      >
        {children}
      </div>
    </div>
  );
}
export function CanvasSplitThread({ ...props }: CanvasSplitThreadProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplitThread"
      data-slot="canvas-split-thread"
      className={cn(
        "border-foreground/[0.07] flex flex-col gap-3 border-b p-4",
        "group-data-[layout=card]/canvas-split:@xl:w-[240px] group-data-[layout=card]/canvas-split:@xl:shrink-0 group-data-[layout=card]/canvas-split:@xl:overflow-y-auto group-data-[layout=card]/canvas-split:@xl:border-e group-data-[layout=card]/canvas-split:@xl:border-b-0",
        "group-data-[layout=fill]/canvas-split:min-h-0 group-data-[layout=fill]/canvas-split:flex-1 group-data-[layout=fill]/canvas-split:overflow-y-auto group-data-[layout=fill]/canvas-split:@3xl:w-[clamp(320px,36%,440px)] group-data-[layout=fill]/canvas-split:@3xl:flex-none group-data-[layout=fill]/canvas-split:@3xl:border-e group-data-[layout=fill]/canvas-split:@3xl:border-b-0",
      )}
      {...props}
    />
  );
}
export function CanvasSplitMessage({ speaker, ...props }: ICanvasSplitMessageProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplitMessage"
      data-slot="canvas-split-message"
      data-speaker={speaker}
      className={cn(
        "fade-in animate-in fill-mode-both text-base leading-relaxed duration-300",
        speaker === "user" ? cn(field, "text-foreground/80 ms-auto rounded-md px-3 py-2") : "text-foreground/60",
      )}
      {...props}
    />
  );
}
export function CanvasSplitDocument({ ...props }: CanvasSplitDocumentProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplitDocument"
      data-slot="canvas-split-document"
      className={cn("flex min-h-0 min-w-0 flex-1 flex-col")}
      {...props}
    />
  );
}
export function CanvasSplitHeader({
  title,
  version,
  saved,
  onCopy,
  onClose,
  ...props
}: ICanvasSplitHeaderProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplitHeader"
      data-slot="canvas-split-header"
      className={cn("border-foreground/[0.07] flex shrink-0 items-center gap-2 border-b px-3.5 py-2.5")}
      {...props}
    >
      <FileTextIcon aria-hidden="true" className={cn("size-4")} />
      <span className="min-w-0 flex-1 truncate text-base font-medium">{title}</span>
      <span className={cn(mono, "text-muted-foreground shrink-0")}>v{version}</span>
      <span
        className={cn(
          mono,
          "shrink-0 transition-colors duration-300",
          saved ? "text-success text-success" : "text-muted-foreground",
        )}
      >
        {saved ? (
          <span className="flex items-center gap-1">
            <CheckIcon aria-hidden="true" className={cn("size-3.5")} />
            saved
          </span>
        ) : (
          "editing"
        )}
      </span>
      <Button
        type="button"
        aria-label={`Copy ${title}`}
        onClick={onCopy}
        disabled={!onCopy}
        variant="ghost"
        size="icon"
      >
        <CopyIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        type="button"
        aria-label="Close the canvas"
        onClick={onClose}
        disabled={!onClose}
        variant="ghost"
        size="icon"
      >
        <XIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}
export function CanvasSplitBody({ writing, children, ...props }: ICanvasSplitBodyProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplitBody"
      data-slot="canvas-split-body"
      className={cn(
        "flex flex-1 flex-col gap-1.5 overflow-y-auto p-4",
        "group-data-[layout=card]/canvas-split:min-h-[144px] group-data-[layout=fill]/canvas-split:min-h-0",
      )}
      {...props}
    >
      {children}
      {writing && (
        <span
          aria-hidden
          className="bg-foreground/70 h-[1.05em] w-[2px] animate-pulse rounded-full motion-reduce:animate-none"
        />
      )}
    </div>
  );
}
export function CanvasSplitLine({ heading, ...props }: ICanvasSplitLineProps): JSX.Element {
  return (
    <p
      data-testid="CanvasSplitLine"
      data-slot="canvas-split-line"
      className={cn(
        "fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-base leading-relaxed duration-300",
        heading ? "text-foreground/95 font-medium" : "text-foreground/65",
      )}
      {...props}
    />
  );
}
interface ICanvasSplitMessageProps extends Omit<ComponentProps<"div">, "className" | "style"> {
  speaker: "user" | "assistant";
}
interface ICanvasSplitHeaderProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "title">,
  "className" | "style"
> {
  title: string;
  version: number;
  saved: boolean;
  onCopy?: () => void;
  onClose?: () => void;
}
interface ICanvasSplitBodyProps extends Omit<ComponentProps<"div">, "className" | "style"> {
  writing?: boolean;
}
interface ICanvasSplitLineProps extends Omit<ComponentProps<"p">, "className" | "style"> {
  heading?: boolean;
}
interface ICanvasSplitProps extends Omit<ComponentProps<"div">, "className" | "style"> {
  /**
   * - `card`: a framed demo-sized card.
   * - `fill`: fills its container as a page layout; the thread and document panes scroll independently and stack
   *   below a 48rem container width.
   */
  layout?: "card" | "fill";
}
type CanvasSplitThreadProps = Omit<ComponentProps<"div">, "className" | "style">;
type CanvasSplitDocumentProps = Omit<ComponentProps<"div">, "className" | "style">;

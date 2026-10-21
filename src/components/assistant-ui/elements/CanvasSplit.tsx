import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { CheckIcon, CopyIcon, FileTextIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export function CanvasSplit({ children, ...props }: CanvasSplitProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplit"
      data-slot="canvas-split"
      className={cn(paper, "@container w-full max-w-3xl overflow-hidden rounded-md")}
      {...props}
    >
      <div className="flex flex-col @xl:h-80 @xl:flex-row">{children}</div>
    </div>
  );
}
export function CanvasSplitThread({ ...props }: CanvasSplitThreadProps): JSX.Element {
  return (
    <div
      data-testid="CanvasSplitThread"
      data-slot="canvas-split-thread"
      className={cn(
        "border-foreground/[0.07] flex flex-col gap-3 border-b p-4 @xl:w-[240px] @xl:shrink-0 @xl:overflow-y-auto @xl:border-r @xl:border-b-0",
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
      className={cn("flex min-w-0 flex-1 flex-col")}
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
      className={cn("border-foreground/[0.07] flex items-center gap-2 border-b px-3.5 py-2.5")}
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
      className={cn("flex min-h-[144px] flex-1 flex-col gap-1.5 overflow-y-auto p-4")}
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
type CanvasSplitProps = Omit<ComponentProps<"div">, "className" | "style">;
type CanvasSplitThreadProps = Omit<ComponentProps<"div">, "className" | "style">;
type CanvasSplitDocumentProps = Omit<ComponentProps<"div">, "className" | "style">;

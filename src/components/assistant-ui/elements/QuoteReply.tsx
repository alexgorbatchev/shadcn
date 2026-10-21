import { Button } from "../../Button.js";
import type { JSX } from "react";
type QuoteReplyProps = Omit<
  ComponentProps<"div">,
  "children" | "before" | "selection" | "after" | "actions" | "toolbarVisible" | "quoted" | "onAction"
> & {
  before: string;
  selection: string;
  after: string;
  actions: readonly IQuoteAction[];
  toolbarVisible: boolean;
  quoted?: string;
  onAction?: (key: string) => void;
};
import type { ComponentProps } from "react";
import { PencilLineIcon, QuoteIcon, SparklesIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { floating, mono } from "./constants.js";
export interface IQuoteAction {
  key: string;
  label: string;
  icon: "quote" | "explain" | "rewrite";
}
const ICON = {
  quote: QuoteIcon,
  explain: SparklesIcon,
  rewrite: PencilLineIcon,
} as const;
export function QuoteReply({
  before,
  selection,
  after,
  actions,
  toolbarVisible,
  quoted,
  onAction,
  className,
  ...props
}: QuoteReplyProps): JSX.Element {
  return (
    <div
      data-testid="QuoteReply"
      data-slot="quote-reply"
      className={cn(cn("flex w-full max-w-sm flex-col gap-2.5"), className)}
      {...props}
    >
      <p className="relative text-base leading-relaxed">
        <span className="text-muted-foreground">{before}</span>
        <span className="text-foreground rounded bg-primary/18 px-0.5 bg-primary/25">{selection}</span>
        <span className="text-muted-foreground">{after}</span>
      </p>

      <div className="flex h-9 items-start">
        {toolbarVisible && onAction && (
          <div
            className={cn(
              floating,
              "fade-in zoom-in-95 slide-in-from-top-1 animate-in flex items-center gap-0.5 rounded-full p-1 duration-200",
            )}
          >
            {actions.map((action) => {
              const Glyph = ICON[action.icon];
              return (
                <Button key={action.key} type="button" onClick={() => onAction(action.key)} variant="ghost">
                  <Glyph aria-hidden="true" data-icon="inline-start" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {quoted && (
        <div className="fade-in slide-in-from-bottom-1 animate-in flex flex-col gap-1 duration-300">
          <span className={cn(mono, "text-muted-foreground")}>replying to</span>
          <div className="border-foreground/15 text-muted-foreground border-s-2 ps-2.5 text-sm leading-relaxed">
            {quoted}
          </div>
        </div>
      )}
    </div>
  );
}

import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { paper } from "./constants.js";
import { take } from "../utils/range.js";
export interface IMessagePairProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "onCopy">,
  "className" | "style"
> {
  userMessage: string;
  words: readonly string[];
  visibleWords: number;
  streaming: boolean;
  variant?: "bubble" | "flat";
  onCopy?: () => void;
  onRegenerate?: () => void;
}
export function MessagePair({
  userMessage,
  words,
  visibleWords,
  streaming,
  variant = "bubble",
  onCopy,
  onRegenerate,
  ...props
}: IMessagePairProps): JSX.Element {
  const shown = take(words, visibleWords);
  return (
    <div
      data-testid="MessagePair"
      data-slot="message-pair"
      className={cn("flex w-full max-w-sm flex-col gap-5")}
      {...props}
    >
      <p
        className={cn(
          "max-w-[85%] self-end text-sm",
          variant === "bubble" ? cn(paper, "rounded-md px-3.5 py-2") : "text-foreground/90 text-end",
        )}
      >
        {userMessage}
      </p>
      <div className="group/message flex flex-col items-start">
        <p className="min-h-[68px] text-sm leading-relaxed">
          {shown.map((word, index) => {
            const fresh = streaming && shown.length - 1 - index < 2;
            return (
              <span
                key={`${word}-${index}`}
                className="fade-in animate-in fill-mode-both duration-500 motion-reduce:animate-none"
              >
                <span
                  className={cn(
                    "transition-colors duration-700 motion-reduce:transition-none",
                    fresh && "text-primary text-primary",
                  )}
                >
                  {word}
                </span>{" "}
              </span>
            );
          })}
          {streaming && shown.length > 0 && (
            <span
              aria-hidden
              className="-mb-0.5 ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none bg-primary"
            />
          )}
        </p>
        {(onCopy || onRegenerate) && (
          <div className="flex items-center gap-1 pt-1 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 motion-reduce:transition-none">
            {onCopy && (
              <Button type="button" aria-label="Copy response" onClick={onCopy} variant="ghost" size="icon">
                <CopyIcon aria-hidden="true" data-icon="inline-start" />
              </Button>
            )}
            {onRegenerate && (
              <Button type="button" aria-label="Regenerate response" onClick={onRegenerate} variant="ghost" size="icon">
                <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

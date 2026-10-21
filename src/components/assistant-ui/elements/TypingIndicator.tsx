import type { JSX } from "react";
type TypingIndicatorProps = Omit<ComponentProps<"div">, "children" | "variant" | "role" | "aria-label"> & {
  variant?: "bubble" | "bare";
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { paper } from "./constants.js";
const DOT_DELAYS = ["[animation-delay:-0.32s]", "[animation-delay:-0.16s]", "[animation-delay:0s]"];
export function TypingIndicator({ variant = "bubble", className, ...props }: TypingIndicatorProps): JSX.Element {
  const dots = DOT_DELAYS.map((delay) => (
    <span
      key={delay}
      aria-hidden
      className={cn(
        "bg-foreground/40 size-1.5 animate-bounce rounded-full motion-reduce:animate-none [animation-duration:1.1s]",
        delay,
      )}
    />
  ));
  if (variant === "bare") {
    return (
      <div
        data-testid="TypingIndicator"
        data-slot="typing-indicator"
        data-variant="bare"
        role="status"
        aria-label="Assistant is typing"
        className={cn(cn("flex gap-1"), className)}
        {...props}
      >
        {dots}
      </div>
    );
  }
  return (
    <div
      data-testid="TypingIndicator"
      data-slot="typing-indicator"
      data-variant="bubble"
      className={cn(cn(paper, "w-fit rounded-full px-4 py-3.5"), className)}
      {...props}
    >
      <div role="status" aria-label="Assistant is typing" className="flex gap-1">
        {dots}
      </div>
    </div>
  );
}

import { cn } from "../../../utils/cn.js";
import type { ComponentProps, JSX } from "react";
type EmptyStateGreetingProps = ComponentProps<"h2">;
export function EmptyStateGreeting({ className, ...props }: EmptyStateGreetingProps): JSX.Element {
  return (
    <h2
      data-testid="EmptyStateGreeting"
      data-slot="empty-state-greeting"
      className={cn(
        "fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-center text-xl font-medium tracking-tight duration-500 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

import { cn } from "../../../utils/cn.js";
import type { ComponentProps, JSX } from "react";
export interface IInlineCitationProps extends ComponentProps<"p"> {}
export function InlineCitation({ className, ...props }: IInlineCitationProps): JSX.Element {
  return (
    <p
      data-testid="InlineCitation"
      data-slot="inline-citation"
      className={cn("text-foreground max-w-sm text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

import type { JSX } from "react";
import { type ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
export function ComposerActions({ ...props }: ComposerActionsProps): JSX.Element {
  return (
    <div
      data-testid="ComposerActions"
      data-slot="composer-actions"
      className={cn("flex items-center gap-1.5")}
      {...props}
    />
  );
}
type ComposerActionsProps = Omit<ComponentProps<"div">, "className" | "style">;

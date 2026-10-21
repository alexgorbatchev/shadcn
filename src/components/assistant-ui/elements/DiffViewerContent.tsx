import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
export function DiffViewerContent({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return (
    <div
      data-testid="DiffViewerContent"
      data-slot="diff-viewer-content"
      className={cn("overflow-x-auto", className)}
      {...props}
    />
  );
}

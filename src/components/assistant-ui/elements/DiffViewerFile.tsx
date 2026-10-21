import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
export function DiffViewerFile({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return <div data-testid="DiffViewerFile" data-slot="diff-viewer-file" className={cn(className)} {...props} />;
}

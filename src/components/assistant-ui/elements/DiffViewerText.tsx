import type { ComponentProps, JSX } from "react";
import type { IParsedDiffLine } from "../utils/diffViewer/types.js";
import { cn } from "../../../utils/cn.js";

export interface IDiffViewerTextProps extends Omit<ComponentProps<"code">, "children"> {
  line: IParsedDiffLine | null;
}
export function DiffViewerText({ line, className, ...props }: IDiffViewerTextProps): JSX.Element {
  return (
    <code
      data-testid="DiffViewerText"
      className={cn("min-w-0 flex-1 pe-3.5 break-all whitespace-pre-wrap", className)}
      {...props}
    >
      {line?.type === "add" ? (
        <ins className="no-underline">{line.content}</ins>
      ) : line?.type === "del" ? (
        <del className="no-underline">{line.content}</del>
      ) : (
        (line?.content ?? "")
      )}
    </code>
  );
}

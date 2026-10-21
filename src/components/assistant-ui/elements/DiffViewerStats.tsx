import type { ComponentProps, JSX } from "react";
import { Badge } from "../../Badge.js";
import { cn } from "../../../utils/cn.js";
export interface IDiffViewerStatsProps extends Omit<ComponentProps<"span">, "children"> {
  additions: number;
  deletions: number;
}
export function DiffViewerStats({ additions, deletions, className, ...props }: IDiffViewerStatsProps): JSX.Element {
  return (
    <span
      data-testid="DiffViewerStats"
      data-slot="diff-viewer-stats"
      className={cn("flex shrink-0 gap-1.5 tabular-nums", className)}
      {...props}
    >
      <Badge variant="success" aria-label={String(additions) + " additions"}>
        +{additions}
      </Badge>
      <Badge variant="destructive" aria-label={String(deletions) + " deletions"}>
        −{deletions}
      </Badge>
    </span>
  );
}

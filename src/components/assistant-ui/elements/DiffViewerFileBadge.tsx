import type { ComponentProps, JSX } from "react";
import { Badge } from "../../Badge.js";
export type DiffViewerFileBadgeProps = Omit<ComponentProps<typeof Badge>, "children"> & {
  filename?: string;
};
export function DiffViewerFileBadge({ filename, ...props }: DiffViewerFileBadgeProps): JSX.Element | null {
  const extension = filename?.split(".").pop()?.toUpperCase();
  if (!extension) return null;
  return (
    <Badge data-testid="DiffViewerFileBadge" data-slot="diff-viewer-file-badge" variant="outline" {...props}>
      {extension}
    </Badge>
  );
}

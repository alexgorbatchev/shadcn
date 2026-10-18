import type { ReactElement } from "react";
import { Badge } from "./Badge.js";

interface IDragDropPreviewProps {
  labels: readonly string[];
  maxItems?: number;
}

export function DragDropPreview({ labels, maxItems = 5 }: IDragDropPreviewProps): ReactElement {
  const limit = Math.max(1, Math.floor(maxItems));
  return (
    <div data-slot="drag-drop-preview" className="flex w-max max-w-64 flex-col items-start gap-1">
      {labels.slice(0, limit).map((label, index) => (
        <Badge key={`${index}:${label}`} variant="secondary" density="compact">
          <span className="max-w-60 truncate">{label}</span>
        </Badge>
      ))}
      {labels.length > limit && (
        <Badge variant="secondary" density="compact">
          +{labels.length - limit} more…
        </Badge>
      )}
    </div>
  );
}

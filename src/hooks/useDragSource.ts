import { useId } from "react";
import { useDragDrop } from "./useDragDrop.js";
import type { IDragSource, IDragSourceOptions } from "../drag-drop/types.js";

export function useDragSource({
  type,
  data,
  labels,
  effectAllowed = "copyMove",
  disabled = false,
}: IDragSourceOptions): IDragSource {
  const { active, start, end } = useDragDrop();
  const sourceId = useId();
  return {
    isDragging: active?.sourceId === sourceId,
    props: {
      draggable: !disabled,
      onDragStart: (event) => {
        if (event.defaultPrevented) return;
        event.stopPropagation();
        if (disabled || labels.length === 0) {
          event.preventDefault();
          return;
        }
        start(event, { sourceId, type, data, labels }, effectAllowed);
      },
      onDragEnd: end,
    },
  };
}

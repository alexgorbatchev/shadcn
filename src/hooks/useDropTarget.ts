import { useId, useState } from "react";
import { useDragDrop } from "./useDragDrop.js";
import type { IDragDropItem, IDropTarget, IDropTargetOptions } from "../drag-drop/types.js";

export function useDropTarget({ accept, canDrop, getDropEffect, onDrop }: IDropTargetOptions): IDropTarget {
  const { active, over, enter, leave, end } = useDragDrop();
  const id = useId();
  const [feedback, setFeedback] = useState<IDropTarget["feedback"]>(null);
  return {
    feedback,
    type: over?.id === id ? over.type : null,
    isOver: over?.id === id,
    isAlt: over?.id === id && over.isAlt,
    effect: over?.id === id ? over.effect : "none",
    props: {
      onDragOver: (event) => {
        const type = accept.find((type) => event.dataTransfer.types.includes(type));
        if (!type) return;
        event.stopPropagation();
        const item = active?.type === type ? active : null;
        const effect = item && canDrop && !canDrop(item) ? "none" : (getDropEffect?.(item, event) ?? "move");
        event.dataTransfer.dropEffect = effect;
        if (effect === "none") {
          leave(id);
          return;
        }
        event.preventDefault();
        setFeedback((current) =>
          current?.type === type && current.isAlt === event.altKey && current.effect === effect
            ? current
            : { type, isAlt: event.altKey, effect },
        );
        enter({ id, type, isAlt: event.altKey, effect });
      },
      onDragLeave: (event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) leave(id);
      },
      onDrop: (event) => {
        const type = accept.find((type) => event.dataTransfer.types.includes(type));
        if (!type) return;
        event.stopPropagation();
        event.preventDefault();
        const raw = event.dataTransfer.getData(type);
        let data: unknown;
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
        const item: IDragDropItem = { type, data, labels: active?.labels ?? [] };
        leave(id);
        end();
        if (!canDrop || canDrop(item)) onDrop(item, event);
      },
    },
  };
}

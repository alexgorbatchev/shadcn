import { useCallback, useEffect, useRef, useState, type PropsWithChildren, type ReactElement } from "react";
import { flushSync } from "react-dom";
import { DragDropContext } from "../drag-drop/DragDropContext.js";
import type { IActiveDrag, IDragDropContext, IDragOver } from "../drag-drop/types.js";
import { DragDropPreview } from "./DragDropPreview.js";

interface IDragDropProviderProps extends PropsWithChildren {
  maxPreviewItems?: number;
}

export function DragDropProvider({ children, maxPreviewItems = 5 }: IDragDropProviderProps): ReactElement {
  const [active, setActive] = useState<IActiveDrag | null>(null);
  const [over, setOver] = useState<IDragOver | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const end = useCallback((): void => {
    setActive(null);
    setOver(null);
  }, []);
  useEffect(() => {
    window.addEventListener("dragend", end);
    window.addEventListener("drop", end);
    return () => {
      window.removeEventListener("dragend", end);
      window.removeEventListener("drop", end);
    };
  }, [end]);
  const start: IDragDropContext["start"] = (event, item, effect) => {
    event.dataTransfer.effectAllowed = effect;
    event.dataTransfer.setData(item.type, JSON.stringify(item.data) ?? "null");
    event.dataTransfer.setData("text/plain", item.labels.join("\n"));
    // The native browser snapshots its drag image synchronously during dragstart.
    flushSync(() => {
      setActive(item);
      setOver(null);
    });
    if (preview.current) event.dataTransfer.setDragImage(preview.current, 12, 12);
  };
  const enter: IDragDropContext["enter"] = (next) =>
    setOver((current) =>
      current?.id === next.id &&
      current.type === next.type &&
      current.isAlt === next.isAlt &&
      current.effect === next.effect
        ? current
        : next,
    );
  const leave: IDragDropContext["leave"] = (id) => setOver((current) => (current?.id === id ? null : current));
  return (
    <DragDropContext value={{ active, over, start, end, enter, leave }}>
      {children}
      <div ref={preview} aria-hidden="true" className="pointer-events-none fixed -left-[10000px] top-0 w-max">
        <DragDropPreview labels={active?.labels ?? []} maxItems={maxPreviewItems} />
      </div>
      <span role="status" aria-label="Drag status" className="sr-only">
        {active && `${active.labels.length} ${active.labels.length === 1 ? "item" : "items"} being dragged`}
      </span>
    </DragDropContext>
  );
}

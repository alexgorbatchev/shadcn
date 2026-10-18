import { useContext } from "react";
import { DragDropContext } from "../drag-drop/DragDropContext.js";
import type { IDragDropContext } from "../drag-drop/types.js";

export function useDragDrop(): IDragDropContext {
  const context = useContext(DragDropContext);
  if (!context) throw new Error("Drag and drop requires DragDropProvider.");
  return context;
}

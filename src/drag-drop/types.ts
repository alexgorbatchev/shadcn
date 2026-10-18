import type { DragEvent, HTMLAttributes } from "react";

export interface IDragDropItem {
  type: string;
  data: unknown;
  labels: readonly string[];
}
export interface IActiveDrag extends IDragDropItem {
  sourceId: string;
}
export interface IDragOver {
  id: string;
  type: string;
  isAlt: boolean;
  effect: DataTransfer["dropEffect"];
}
export interface IDragDropContext {
  active: IActiveDrag | null;
  over: IDragOver | null;
  start: (event: DragEvent<HTMLElement>, item: IActiveDrag, effect: DataTransfer["effectAllowed"]) => void;
  end: () => void;
  enter: (over: IDragOver) => void;
  leave: (id: string) => void;
}
export interface IDragSourceOptions extends IDragDropItem {
  effectAllowed?: DataTransfer["effectAllowed"];
  disabled?: boolean;
}
export interface IDragSource {
  props: Pick<HTMLAttributes<HTMLElement>, "draggable" | "onDragStart" | "onDragEnd">;
  isDragging: boolean;
}
export interface IDropTargetOptions {
  accept: readonly string[];
  canDrop?: (item: IDragDropItem) => boolean;
  getDropEffect?: (item: IDragDropItem | null, event: DragEvent<HTMLElement>) => DataTransfer["dropEffect"];
  onDrop: (item: IDragDropItem, event: DragEvent<HTMLElement>) => void;
}
export interface IDropTarget {
  feedback: Pick<IDragOver, "type" | "isAlt" | "effect"> | null;
  type: string | null;
  props: Pick<HTMLAttributes<HTMLElement>, "onDragOver" | "onDragLeave" | "onDrop">;
  isOver: boolean;
  isAlt: boolean;
  effect: DataTransfer["dropEffect"];
}

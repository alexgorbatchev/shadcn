import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ReactElement } from "react";
import { useDragSource } from "../hooks/useDragSource.js";
import type { IDragSourceOptions } from "../drag-drop/types.js";

type DragSourceState = { slot: "drag-source"; dragging: boolean };
type DragSourceProps = Omit<useRender.ComponentProps<"div", DragSourceState>, "onDragStart" | "onDragEnd"> &
  IDragSourceOptions;

export function DragSource({
  type,
  data,
  labels,
  effectAllowed,
  disabled,
  render,
  ...props
}: DragSourceProps): ReactElement {
  const source = useDragSource({ type, data, labels, effectAllowed, disabled });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(props, source.props),
    state: { slot: "drag-source", dragging: source.isDragging },
  });
}

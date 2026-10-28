import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ReactElement } from "react";
import { useDropTarget } from "../hooks/useDropTarget.js";
import type { IDropTargetOptions } from "../drag-drop/types.js";

type DropTargetState = { slot: "drop-target"; over: boolean; effect: DataTransfer["dropEffect"] };
type DropTargetProps = Omit<useRender.ComponentProps<"div", DropTargetState>, "onDrop"> & IDropTargetOptions;

export function DropTarget({
  analytics,
  accept,
  canDrop,
  getDropEffect,
  onDrop,
  render,
  ...props
}: DropTargetProps): ReactElement {
  const target = useDropTarget({ analytics, accept, canDrop, getDropEffect, onDrop });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(props, target.props),
    state: { slot: "drop-target", over: target.isOver, effect: target.effect },
  });
}

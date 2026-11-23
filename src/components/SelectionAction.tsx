import { useLayoutEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ISelectionActionProps {
  /** The block where the action should appear in keyboard navigation order. */
  anchor: Element;
  /** Append to the anchor when it is the surrounding content container. */
  isInsideAnchor?: boolean;
  /** Mark the host so applications can exclude it from text extraction. */
  attributes?: Readonly<Record<`data-${string}`, string>>;
  children: ReactNode;
}

const GAP = 6;
const MARGIN = 8;

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(value, high));
}

/** Floating actions for a native text selection, kept beside the selected lines as the layout changes. */
export function SelectionAction({
  anchor,
  isInsideAnchor,
  attributes,
  children,
}: ISelectionActionProps): ReactElement | null {
  const [host, setHost] = useState<HTMLElement>();
  useLayoutEffect(() => {
    const element = anchor.ownerDocument.createElement("div");
    element.dataset.slot = "selection-action";
    element.dataset.scroll = "none";
    element.className = "fixed z-50 flex max-w-[calc(100vw-1rem)] flex-wrap items-center gap-2";
    element.style.inset = "0 auto auto 0";
    element.style.visibility = "hidden";
    for (const [name, value] of Object.entries(attributes ?? {})) element.setAttribute(name, value);
    if (isInsideAnchor) anchor.append(element);
    else anchor.after(element);
    setHost(element);
    return () => element.remove();
  }, [anchor, isInsideAnchor, attributes]);

  useLayoutEffect(() => {
    const doc = anchor.ownerDocument;
    const view = doc.defaultView;
    if (!host || !view) return;
    let frame = 0;
    let left = 0;
    let top = 0;
    const place = () => {
      frame = view.requestAnimationFrame(place);
      const selection = doc.getSelection();
      const range = selection?.rangeCount === 1 && !selection.isCollapsed ? selection.getRangeAt(0) : undefined;
      const viewport = view.visualViewport;
      const minX = (viewport?.offsetLeft ?? 0) + MARGIN;
      const minY = (viewport?.offsetTop ?? 0) + MARGIN;
      const maxX = minX + (viewport?.width ?? view.innerWidth) - 2 * MARGIN;
      const maxY = minY + (viewport?.height ?? view.innerHeight) - 2 * MARGIN;
      const lines = Array.from(range?.getClientRects() ?? []).filter(
        (rect) => rect.width > 0 && rect.height > 0 && rect.bottom > minY && rect.top < maxY,
      );
      const first = lines[0];
      const last = lines.at(-1);
      if (!first || !last || !range || !anchor.contains(range.endContainer)) {
        host.style.visibility = "hidden";
        return;
      }
      const block = anchor.getBoundingClientRect();
      const box = host.getBoundingClientRect();
      const { width, height } = box;
      const belowBlock = block.bottom + GAP;
      const aboveBlock = block.top - GAP - height;
      const besideBlock = block.right + GAP;
      const sideGap = besideBlock - last.right;
      const nearAbove = first.top - GAP - height;
      const nearBelow = last.bottom + GAP;

      let x = last.left;
      let y = nearBelow;
      if (belowBlock >= nearBelow && belowBlock <= nearBelow + height && belowBlock + height <= maxY) {
        y = belowBlock;
      } else if (block.width > 0 && sideGap >= GAP && sideGap <= height && besideBlock + width <= maxX) {
        x = besideBlock;
        y = last.top + (last.height - height) / 2;
      } else if (aboveBlock >= minY && aboveBlock <= nearAbove && aboveBlock >= nearAbove - height) {
        x = first.left;
        y = aboveBlock;
      } else if (nearBelow + height > maxY && nearAbove >= minY) {
        x = first.left;
        y = nearAbove;
      }

      // A container query or transform can establish the fixed containing block.
      const nextLeft = left + clamp(x, minX, maxX - width) - box.left;
      const nextTop = top + clamp(y, minY, maxY - height) - box.top;
      if (Math.abs(nextLeft - left) >= 0.5) {
        left = nextLeft;
        host.style.left = `${left}px`;
      }
      if (Math.abs(nextTop - top) >= 0.5) {
        top = nextTop;
        host.style.top = `${top}px`;
      }
      host.style.visibility = "";
    };
    place();
    return () => view.cancelAnimationFrame(frame);
  }, [anchor, host]);
  return host ? createPortal(children, host) : null;
}

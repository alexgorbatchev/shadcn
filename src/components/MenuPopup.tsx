"use client";
import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import { useDirection } from "./DirectionProvider.js";
import type { MenuPoint, MenuPopupProps } from "../menu/types.js";
import { useMemo, type ReactElement } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "../utils/cn.js";

function MenuPortal({ container, ref, children, ...props }: MenuPrimitive.Portal.Props): ReactElement {
  const resolvedContainer = usePortalContainer(container);
  const portal = usePortalNode(ref);
  return (
    <MenuPrimitive.Portal data-slot="dropdown-menu-portal" container={resolvedContainer} ref={portal.ref} {...props}>
      <PortalProvider container={portal.node}>{children}</PortalProvider>
    </MenuPrimitive.Portal>
  );
}

/**
 * An anchor at the point, which Base UI positions against as it does a context menu's pointer: zero-size for a
 * pointer, or as tall as the row it was opened from, so the menu flips to the row's other side instead of over it.
 */
function usePointAnchor(point: MenuPoint | undefined): MenuPrimitive.Positioner.Props["anchor"] {
  const x = point?.clientX;
  const y = point?.clientY;
  const height = point?.height ?? 0;
  return useMemo(
    () =>
      x === undefined || y === undefined
        ? undefined
        : { getBoundingClientRect: () => DOMRect.fromRect({ x, y, width: 0, height }) },
    [x, y, height],
  );
}

function MenuPopup({
  density,
  width = "content",
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  point,
  className,
  ...props
}: MenuPopupProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();
  const anchor = usePointAnchor(point);
  // A menu flips to the side with room, then `sticky` lets it shift along that side's axis too, over its trigger or
  // point if it must, so a menu shorter than the window always lies wholly inside it instead of shrinking into a
  // scroller. Menus never scroll; the development ScrollGuard reports one taller than the window.
  const placement = anchor
    ? { anchor, align: "start" as const, alignOffset: 0, side: "bottom" as const, sideOffset: 0, sticky: true }
    : { align, alignOffset, side, sideOffset, sticky: true };

  return (
    <MenuPortal>
      <MenuPrimitive.Positioner dir={direction} className="isolate outline-none" {...placement}>
        <MenuPrimitive.Popup
          dir={direction}
          data-density={resolvedDensity}
          data-slot="dropdown-menu-content"
          // Menus never scroll: the development ScrollGuard reports one whose content outgrows the viewport.
          data-scroll="none"
          className={(state) =>
            cn(
              "max-h-(--available-height) max-w-(--available-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-frame border border-frame-edge shadow-frame duration-120 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0",
              width === "anchor" ? "w-(--anchor-width)" : "w-max",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPortal>
  );
}

export { MenuPortal, MenuPopup };

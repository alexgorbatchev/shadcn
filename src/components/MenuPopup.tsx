"use client";
import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import { useDirection } from "./DirectionProvider.js";
import type { MenuPopupProps } from "../menu/types.js";
import type { ReactElement } from "react";
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

function MenuPopup({
  density,
  width = "content",
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPopupProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();

  return (
    <MenuPortal>
      <MenuPrimitive.Positioner
        dir={direction}
        className="isolate outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          dir={direction}
          data-density={resolvedDensity}
          data-slot="dropdown-menu-content"
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

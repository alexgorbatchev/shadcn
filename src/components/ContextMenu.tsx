import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import type { ReactElement } from "react";

import { useDirection } from "@base-ui/react/direction-provider";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { cn } from "../utils/cn.js";

function ContextMenu({ analytics, ...props }: ContextMenuPrimitive.Root.Props & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "ContextMenu",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} onOpenChange={trackedOnOpenChange} />;
}

function ContextMenuPortal({ container, ref, children, ...props }: ContextMenuPrimitive.Portal.Props): ReactElement {
  const resolvedContainer = usePortalContainer(container);
  const portal = usePortalNode(ref);
  return (
    <ContextMenuPrimitive.Portal
      data-slot="context-menu-portal"
      container={resolvedContainer}
      ref={portal.ref}
      {...props}
    >
      <PortalProvider container={portal.node}>{children}</PortalProvider>
    </ContextMenuPrimitive.Portal>
  );
}

type ContextMenuTriggerProps = ContextMenuPrimitive.Trigger.Props & IDensityProps;

function ContextMenuTrigger({ density, className, ...props }: ContextMenuTriggerProps): ReactElement {
  return (
    <ContextMenuPrimitive.Trigger
      data-density={density}
      data-slot="context-menu-trigger"
      className={(state) => cn("select-none", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

type ContextMenuContentProps = ContextMenuPrimitive.Popup.Props &
  Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps;

function ContextMenuContent({
  density,
  className,
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 0,
  ...props
}: ContextMenuContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Positioner
        dir={direction}
        className="isolate  outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          dir={direction}
          data-density={resolvedDensity}
          data-slot="context-menu-content"
          className={(state) =>
            cn(
              "   max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover p-1 text-popover-foreground  border border-frame-edge shadow-frame duration-100 outline-none       data-open:animate-in data-open:fade-in-0  data-closed:animate-out data-closed:fade-out-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none ",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPortal>
  );
}

export {
  MenuGroup as ContextMenuGroup,
  MenuLabel as ContextMenuLabel,
  MenuItem as ContextMenuItem,
  MenuCheckboxItem as ContextMenuCheckboxItem,
  MenuRadioGroup as ContextMenuRadioGroup,
  MenuRadioItem as ContextMenuRadioItem,
  MenuSeparator as ContextMenuSeparator,
  MenuShortcut as ContextMenuShortcut,
  MenuSub as ContextMenuSub,
  MenuSubTrigger as ContextMenuSubTrigger,
  MenuSubContent as ContextMenuSubContent,
} from "./MenuParts.js";

export { ContextMenu, ContextMenuPortal, ContextMenuTrigger, ContextMenuContent };

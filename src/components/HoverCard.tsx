import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import { useDensity } from "../hooks/useDensity.js";
import { usePortalContainer } from "../hooks/usePortalContainer.js";
import { usePortalNode } from "../hooks/usePortalNode.js";
import { PortalProvider } from "./PortalProvider.js";
import type { ReactElement } from "react";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { useDirection } from "@base-ui/react/direction-provider";
import { cn } from "../utils/cn.js";

function HoverCard<Payload>({
  analytics,
  ...props
}: PreviewCardPrimitive.Root.Props<Payload> & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "HoverCard",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} onOpenChange={trackedOnOpenChange} />;
}

function HoverCardTrigger<Payload>({ ...props }: PreviewCardPrimitive.Trigger.Props<Payload>): ReactElement {
  return <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

type HoverCardContentProps = PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps;

function HoverCardContent({
  density,
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  ...props
}: HoverCardContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();
  const container = usePortalContainer();
  const portal = usePortalNode();

  return (
    <PreviewCardPrimitive.Portal container={container} ref={portal.ref} data-slot="hover-card-portal">
      <PortalProvider container={portal.node}>
        <PreviewCardPrimitive.Positioner
          dir={direction}
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
          className="isolate "
        >
          <PreviewCardPrimitive.Popup
            data-density={resolvedDensity}
            data-slot="hover-card-content"
            data-scroll="none"
            className={(state) =>
              cn(
                " w-64 origin-(--transform-origin) rounded-sm bg-popover p-panel text-sm text-popover-foreground  border border-frame-edge shadow-frame outline-hidden duration-100       data-open:animate-in data-open:fade-in-0  data-closed:animate-out data-closed:fade-out-0 ",
                typeof className === "function" ? className(state) : className,
              )
            }
            {...props}
          />
        </PreviewCardPrimitive.Positioner>
      </PortalProvider>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

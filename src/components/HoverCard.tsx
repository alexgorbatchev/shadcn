import type { IDensityProps } from "../density/types.js";
import { useDensity } from "../hooks/useDensity.js";
import type { ReactElement } from "react";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { useDirection } from "@base-ui/react/direction-provider";
import { cn } from "../utils/cn.js";

function HoverCard<Payload>({ ...props }: PreviewCardPrimitive.Root.Props<Payload>): ReactElement {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />;
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

  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
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
          className={(state) =>
            cn(
              " w-64 origin-(--transform-origin) rounded-sm bg-popover p-panel text-sm text-popover-foreground  border border-frame-edge shadow-frame outline-hidden duration-100       data-open:animate-in data-open:fade-in-0  data-closed:animate-out data-closed:fade-out-0 ",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

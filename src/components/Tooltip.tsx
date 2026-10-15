import { useDensity } from "../hooks/useDensity.js";
import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { useDirection } from "./DirectionProvider.js";
import { cn } from "../utils/cn.js";

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props): ReactElement {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

function Tooltip<Payload>({ ...props }: TooltipPrimitive.Root.Props<Payload>): ReactElement {
  return <TooltipPrimitive.Root<Payload> data-slot="tooltip" {...props} />;
}

function TooltipTrigger<Payload>({ ...props }: TooltipPrimitive.Trigger.Props<Payload>): ReactElement {
  return <TooltipPrimitive.Trigger<Payload> data-slot="tooltip-trigger" {...props} />;
}

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps;

function TooltipContent({
  density,
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipContentProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const direction = useDirection();

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        dir={direction}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate "
      >
        <TooltipPrimitive.Popup
          data-density={resolvedDensity}
          data-slot="tooltip-content"
          className={(state) =>
            cn(
              "inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-control-gap rounded-md border border-frame-edge shadow-frame bg-popover px-3 py-1.5 font-sans text-xs text-popover-foreground has-data-[slot=kbd]:pe-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **: **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
              typeof className === "function" ? className(state) : className,
            )
          }
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className=" size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-popover fill-popover data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-start-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-end-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

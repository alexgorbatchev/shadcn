import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import { cn } from "../utils/cn.js";

function Meter({ density, className, ...props }: MeterPrimitive.Root.Props & IDensityProps): ReactElement {
  return (
    <MeterPrimitive.Root
      data-density={density}
      data-slot="meter"
      className={(state) =>
        cn(
          "flex min-w-0 flex-wrap items-center gap-field-gap",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MeterLabel({ density, className, ...props }: MeterPrimitive.Label.Props & IDensityProps): ReactElement {
  return (
    <MeterPrimitive.Label
      data-density={density}
      data-slot="meter-label"
      className={(state) => cn("text-sm font-medium", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

function MeterValue({ density, className, ...props }: MeterPrimitive.Value.Props & IDensityProps): ReactElement {
  return (
    <MeterPrimitive.Value
      data-density={density}
      data-slot="meter-value"
      className={(state) =>
        cn(
          "ms-auto text-sm text-muted-foreground tabular-nums",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MeterTrack({ density, className, ...props }: MeterPrimitive.Track.Props & IDensityProps): ReactElement {
  return (
    <MeterPrimitive.Track
      data-density={density}
      data-slot="meter-track"
      className={(state) =>
        cn(
          "h-1 w-full overflow-hidden rounded-sm bg-muted",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function MeterIndicator({
  density,
  className,
  ...props
}: MeterPrimitive.Indicator.Props & IDensityProps): ReactElement {
  return (
    <MeterPrimitive.Indicator
      data-density={density}
      data-slot="meter-indicator"
      className={(state) =>
        cn(
          "h-full bg-primary transition-[width] motion-reduce:transition-none",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { Meter, MeterLabel, MeterValue, MeterTrack, MeterIndicator };

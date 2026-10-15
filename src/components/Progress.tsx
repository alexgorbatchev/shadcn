import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "../utils/cn";

type ProgressProps = ProgressPrimitive.Root.Props & IDensityProps;

function Progress({ density, className, children, value, ...props }: ProgressProps): ReactElement {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-density={density}
      data-slot="progress"
      className={(state) => cn("flex flex-wrap gap-3", typeof className === "function" ? className(state) : className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

type ProgressTrackProps = ProgressPrimitive.Track.Props & IDensityProps;

function ProgressTrack({ density, className, ...props }: ProgressTrackProps): ReactElement {
  return (
    <ProgressPrimitive.Track
      className={(state) =>
        cn(
          "relative flex h-1 w-full items-center overflow-x-hidden rounded-sm bg-muted",
          typeof className === "function" ? className(state) : className,
        )
      }
      data-density={density}
      data-slot="progress-track"
      {...props}
    />
  );
}

type ProgressIndicatorProps = ProgressPrimitive.Indicator.Props & IDensityProps;

function ProgressIndicator({ density, className, ...props }: ProgressIndicatorProps): ReactElement {
  return (
    <ProgressPrimitive.Indicator
      data-density={density}
      data-slot="progress-indicator"
      className={(state) =>
        cn("h-full bg-primary transition-[width]", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type ProgressLabelProps = ProgressPrimitive.Label.Props & IDensityProps;

function ProgressLabel({ density, className, ...props }: ProgressLabelProps): ReactElement {
  return (
    <ProgressPrimitive.Label
      className={(state) => cn("text-sm font-medium", typeof className === "function" ? className(state) : className)}
      data-density={density}
      data-slot="progress-label"
      {...props}
    />
  );
}

type ProgressValueProps = ProgressPrimitive.Value.Props & IDensityProps;

function ProgressValue({ density, className, ...props }: ProgressValueProps): ReactElement {
  return (
    <ProgressPrimitive.Value
      className={(state) =>
        cn(
          "ms-auto text-sm text-muted-foreground tabular-nums",
          typeof className === "function" ? className(state) : className,
        )
      }
      data-density={density}
      data-slot="progress-value"
      {...props}
    />
  );
}

export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue };

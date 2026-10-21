import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "../utils/cn.js";

type ProgressTone = "primary" | "success" | "warning" | "destructive" | "muted";
type ProgressProps = ProgressPrimitive.Root.Props & IDensityProps & { tone?: ProgressTone };

const progressToneClasses: Record<ProgressTone, string> = {
  primary: "[--progress-color:var(--primary)]",
  success: "[--progress-color:var(--success)]",
  warning: "[--progress-color:var(--warning)]",
  destructive: "[--progress-color:var(--destructive)]",
  muted: "[--progress-color:var(--muted-foreground)]",
};

function Progress({ density, className, children, value, tone = "primary", ...props }: ProgressProps): ReactElement {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-density={density}
      data-slot="progress"
      className={(state) =>
        cn(
          "flex flex-wrap gap-3",
          progressToneClasses[tone],
          typeof className === "function" ? className(state) : className,
        )
      }
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
        cn(
          "h-full bg-[var(--progress-color,var(--primary))] transition-[width] motion-reduce:transition-none",
          typeof className === "function" ? className(state) : className,
        )
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

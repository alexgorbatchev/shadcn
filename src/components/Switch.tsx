import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "../utils/cn.js";

type SwitchProps = IAnalyticsProps &
  SwitchPrimitive.Root.Props & {
    size?: "sm" | "default";
    /** Visually distinguishes an unset/unanswered switch from an explicit Off choice. */
    indeterminate?: boolean;
  } & IDensityProps;

function Switch({
  analytics,
  density,
  className,
  size = "default",
  indeterminate = false,
  ...props
}: SwitchProps): ReactElement {
  const trackedOnCheckedChange = useAnalyticsCallback(
    "Switch",
    analytics,
    { name: "ui.change-request" },
    props.onCheckedChange,
  );

  return (
    <SwitchPrimitive.Root
      data-density={density}
      data-slot="switch"
      data-size={size}
      data-indeterminate={indeterminate ? "" : undefined}
      className={(state) =>
        cn(
          "peer group/switch relative inline-flex shrink-0 items-center rounded-sm border border-input transition-colors outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive data-[size=default]:h-6 data-[size=default]:w-10 data-[size=sm]:h-4 data-[size=sm]:w-7 data-checked:border-primary data-checked:bg-primary data-unchecked:bg-muted data-indeterminate:border-dashed data-indeterminate:border-muted-foreground data-indeterminate:bg-secondary data-disabled:cursor-not-allowed data-disabled:opacity-50 forced-colors:data-checked:border-[Highlight] forced-colors:data-checked:bg-[Highlight]",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onCheckedChange={trackedOnCheckedChange}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        data-indeterminate={indeterminate ? "" : undefined}
        className="pointer-events-none absolute top-1/2 start-0.5 block -translate-y-1/2 rounded-xs bg-foreground ring-0 forced-colors:bg-[CanvasText] forced-colors:data-checked:bg-[HighlightText] transition-[inset-inline-start,background-color] group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-2.5 data-checked:bg-primary-foreground group-data-[size=default]/switch:data-checked:start-[calc(100%-1rem-2px)] group-data-[size=sm]/switch:data-checked:start-[calc(100%-0.625rem-2px)] data-indeterminate:start-1/2 data-indeterminate:h-1 data-indeterminate:-translate-x-1/2 data-indeterminate:bg-muted-foreground group-data-[size=default]/switch:data-indeterminate:w-3 group-data-[size=sm]/switch:data-indeterminate:w-2"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

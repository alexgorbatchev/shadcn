import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "../utils/cn.js";

type SwitchProps = IAnalyticsProps &
  SwitchPrimitive.Root.Props & {
    size?: "sm" | "default";
  } & IDensityProps;

function Switch({ analytics, density, className, size = "default", ...props }: SwitchProps): ReactElement {
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
      className={(state) =>
        cn(
          "peer group/switch relative inline-flex shrink-0 items-center rounded-sm border border-transparent transition-colors outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-checked:bg-primary data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onCheckedChange={trackedOnCheckedChange}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none absolute top-1/2 start-0 block -translate-y-1/2 rounded-sm bg-primary-foreground ring-0 transition-[inset-inline-start] group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:start-[calc(100%-1rem)] group-data-[size=sm]/switch:data-checked:start-[calc(100%-0.75rem)]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

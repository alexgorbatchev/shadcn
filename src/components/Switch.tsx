import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "../utils/cn";

type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
} & IDensityProps;

function Switch({ density, className, size = "default", ...props }: SwitchProps): ReactElement | null {
  return (
    <SwitchPrimitive.Root
      data-density={density}
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-sm border border-transparent transition-colors outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-checked:bg-primary data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-sm bg-primary-foreground ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

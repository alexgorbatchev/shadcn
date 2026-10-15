import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../utils/cn";

type NativeSelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

function NativeSelect({
  density,
  className,
  dir,
  size = "default",
  ...props
}: NativeSelectProps & IDensityProps): ReactElement {
  return (
    <div
      dir={dir}
      className={cn("group/native-select relative w-fit has-[select:disabled]:opacity-50", className)}
      data-density={density}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        dir={dir}
        data-slot="native-select"
        data-size={size}
        className="h-control w-full min-w-0 appearance-none rounded-sm border border-input bg-secondary py-1 pe-8 ps-2.5 text-sm transition-colors outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive data-[size=sm]:h-control-sm data-[size=sm]:rounded-sm data-[size=sm]:py-0.5"
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 end-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

type NativeSelectOptionProps = ComponentProps<"option"> & IDensityProps;

function NativeSelectOption({ density, className, ...props }: NativeSelectOptionProps): ReactElement {
  return (
    <option
      data-density={density}
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

type NativeSelectOptGroupProps = ComponentProps<"optgroup"> & IDensityProps;

function NativeSelectOptGroup({ density, className, ...props }: NativeSelectOptGroupProps): ReactElement {
  return (
    <optgroup
      data-density={density}
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };

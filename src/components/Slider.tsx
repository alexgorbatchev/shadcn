import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "../utils/cn";

type SliderProps<Value extends number | readonly number[] = number | readonly number[]> =
  SliderPrimitive.Root.Props<Value> &
    IDensityProps &
    Pick<SliderPrimitive.Thumb.Props, "getAriaLabel" | "getAriaValueText">;

function Slider<Value extends number | readonly number[] = number | readonly number[]>({
  density,
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  getAriaLabel,
  getAriaValueText,
  ...props
}: SliderProps<Value>): ReactElement {
  const values = value ?? defaultValue ?? min;
  const thumbCount = typeof values === "number" ? 1 : values.length;

  return (
    <SliderPrimitive.Root
      className={(state) =>
        cn(
          state.orientation === "horizontal" ? "w-full" : "h-full",
          typeof className === "function" ? className(state) : className,
        )
      }
      data-density={density}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            index={index}
            getAriaLabel={getAriaLabel}
            getAriaValueText={getAriaValueText}
            className="relative block size-3 shrink-0 rounded-full border border-ring bg-background ring-ring transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-1 focus-visible:outline-hidden active:ring-3 data-disabled:pointer-events-none data-disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };

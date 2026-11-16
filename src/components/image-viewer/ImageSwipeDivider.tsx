import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { ChevronsLeftRightIcon } from "lucide-react";
import type { ReactElement } from "react";

interface IImageSwipeDividerProps {
  /** Percentage of the image width showing the before image, from the left edge. */
  value: number;
  onValueChange: (value: number) => void;
  beforeLabel: string;
  afterLabel: string;
}

/**
 * Draggable divider between the before (left) and after (right) images. Base UI's slider supplies the native range
 * semantics, keyboard steps and pointer capture; only the handle accepts pointer input so the rest of the image keeps
 * native panning. The layout is physical, so it stays left-to-right in right-to-left documents.
 */
export function ImageSwipeDivider({
  value,
  onValueChange,
  beforeLabel,
  afterLabel,
}: IImageSwipeDividerProps): ReactElement {
  return (
    <DirectionProvider direction="ltr">
      <SliderPrimitive.Root
        dir="ltr"
        data-slot="image-swipe-divider"
        value={value}
        onValueChange={onValueChange}
        min={0}
        max={100}
        step={1}
        largeStep={10}
        className="pointer-events-none absolute inset-0"
      >
        <SliderPrimitive.Control className="pointer-events-none absolute inset-0">
          <SliderPrimitive.Thumb
            data-slot="image-swipe-divider-handle"
            getAriaLabel={() => "Swipe divider"}
            getAriaValueText={(_formatted, current) => `${beforeLabel} ${current}%, ${afterLabel} ${100 - current}%`}
            className="group/divider pointer-events-auto flex h-full w-6 cursor-ew-resize touch-none flex-col items-center justify-center select-none"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 start-1/2 w-0.5 -translate-x-1/2 bg-foreground ring-1 ring-background"
            />
            <span
              aria-hidden="true"
              className="relative flex h-8 w-5 items-center justify-center rounded-sm border border-border bg-background text-foreground shadow-frame group-has-[:focus-visible]/divider:border-ring group-has-[:focus-visible]/divider:ring-1 group-has-[:focus-visible]/divider:ring-ring group-data-dragging/divider:border-ring"
            >
              <ChevronsLeftRightIcon className="size-3.5" />
            </span>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
    </DirectionProvider>
  );
}

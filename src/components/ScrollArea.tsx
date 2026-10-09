import type { IDensityProps } from "../density/types";
import type { ReactElement, ReactNode } from "react";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cn } from "../utils/cn";

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props &
  IDensityProps & {
    scrollbars?: ReactNode;
  };

function ScrollArea({
  density,
  className,
  children,
  scrollbars = <ScrollBar />,
  ...props
}: ScrollAreaProps): ReactElement | null {
  return (
    <ScrollAreaPrimitive.Root
      data-density={density}
      data-slot="scroll-area"
      className={(state) => cn("relative", typeof className === "function" ? className(state) : className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {scrollbars}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

type ScrollBarProps = ScrollAreaPrimitive.Scrollbar.Props & IDensityProps;

function ScrollBar({ density, className, orientation = "vertical", ...props }: ScrollBarProps): ReactElement | null {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-density={density}
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={(state) =>
        cn(
          "flex touch-none p-px transition-colors select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-s data-[orientation=vertical]:border-s-transparent",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };

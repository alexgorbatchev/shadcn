import { useContext } from "react";
import { CarouselContext } from "../CarouselContext.js";
import type { ICarouselContextValue } from "../types.js";

export function useCarousel(): ICarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within Carousel.");
  return context;
}

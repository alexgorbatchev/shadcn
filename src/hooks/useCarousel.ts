import { useContext } from "react";
import { CarouselContext } from "../carousel/CarouselContext";
import type { ICarouselContextValue } from "../carousel/types";

export function useCarousel(): ICarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within Carousel.");
  return context;
}

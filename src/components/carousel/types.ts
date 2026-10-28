import type { IAnalyticsProps } from "../../analytics/types.js";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import type useEmblaCarousel from "embla-carousel-react";
import type { ComponentProps } from "react";
import type { IDensityProps } from "../../density/types.js";

export type CarouselApi = UseEmblaCarouselType[1];
export type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
export type CarouselPlugins = Parameters<typeof useEmblaCarousel>[1];
export type CarouselProps = IAnalyticsProps &
  ComponentProps<"div"> &
  IDensityProps & {
    opts?: CarouselOptions;
    plugins?: CarouselPlugins;
    orientation?: "horizontal" | "vertical";
    setApi?: (api: CarouselApi) => void;
  };
export interface ICarouselContextValue {
  carouselRef: UseEmblaCarouselType[0];
  api: CarouselApi;
  orientation: "horizontal" | "vertical";
  direction: "ltr" | "rtl";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

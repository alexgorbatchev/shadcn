import { type BaseComponentProps } from "@json-render/react";
import { Carousel as CarouselPrimitive } from "../carousel/index.js";
import { CarouselContent } from "../carousel/index.js";
import { CarouselItem } from "../carousel/index.js";
import { CarouselNext } from "../carousel/index.js";
import { CarouselPrevious } from "../carousel/index.js";
import { type JsonProps } from "./catalog.js";
export const JsonCarousel = ({ props }: BaseComponentProps<JsonProps<"Carousel">>) => {
  const items = props.items ?? [];
  return (
    <CarouselPrimitive className="w-full">
      <CarouselContent>
        {items.map((item, i) => (
          <CarouselItem key={i} className="basis-3/4 md:basis-1/2 lg:basis-1/3">
            <div className="border border-border rounded-lg p-4 bg-card h-full">
              {item.title && <h4 className="font-semibold text-sm mb-1">{item.title}</h4>}
              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </CarouselPrimitive>
  );
};

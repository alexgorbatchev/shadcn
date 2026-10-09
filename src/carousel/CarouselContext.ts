import { createContext } from "react";
import type { ICarouselContextValue } from "./types";

export const CarouselContext = createContext<ICarouselContextValue | null>(null);

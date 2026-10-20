import { createContext } from "react";
import type { ICarouselContextValue } from "./types.js";

export const CarouselContext = createContext<ICarouselContextValue | null>(null);

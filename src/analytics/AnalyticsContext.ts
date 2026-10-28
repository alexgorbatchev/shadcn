import { createContext } from "react";
import type { IAnalyticsContext } from "./types.js";

export const AnalyticsContext = createContext<IAnalyticsContext | null>(null);

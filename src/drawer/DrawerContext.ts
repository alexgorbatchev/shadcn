import { createContext } from "react";
import type { IDrawerContext } from "./types.js";

export const DrawerContext = createContext<IDrawerContext | null>(null);

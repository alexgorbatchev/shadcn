import { createContext } from "react";
import type { IDrawerContext } from "./types";

export const DrawerContext = createContext<IDrawerContext | null>(null);

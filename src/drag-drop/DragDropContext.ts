import { createContext } from "react";
import type { IDragDropContext } from "./types.js";

export const DragDropContext = createContext<IDragDropContext | null>(null);

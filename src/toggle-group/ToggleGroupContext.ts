import { createContext } from "react";
import type { IToggleGroupContext } from "./types.js";

export const ToggleGroupContext = createContext<IToggleGroupContext>({ spacing: 2 });

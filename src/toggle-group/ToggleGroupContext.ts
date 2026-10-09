import { createContext } from "react";
import type { IToggleGroupContext } from "./types";

export const ToggleGroupContext = createContext<IToggleGroupContext>({ spacing: 2 });

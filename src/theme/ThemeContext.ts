import { createContext } from "react";
import type { IThemeContextValue } from "./types.js";

export const ThemeContext = createContext<IThemeContextValue | null>(null);

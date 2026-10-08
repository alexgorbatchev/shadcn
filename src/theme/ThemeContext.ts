import { createContext } from "react";
import type { IThemeContextValue } from "./types";

export const ThemeContext = createContext<IThemeContextValue | null>(null);

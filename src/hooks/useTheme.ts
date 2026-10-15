import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeContext.js";
import type { IThemeContextValue } from "../theme/types.js";

export function useTheme(): IThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}

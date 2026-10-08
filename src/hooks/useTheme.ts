import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeContext";
import type { IThemeContextValue } from "../theme/types";

export function useTheme(): IThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}

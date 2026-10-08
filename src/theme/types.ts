import type { TernaryDarkMode } from "usehooks-ts";

export type ThemeMode = TernaryDarkMode;
export type ResolvedTheme = "light" | "dark";

export interface IThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

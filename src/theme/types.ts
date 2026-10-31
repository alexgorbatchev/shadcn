import type { TernaryDarkMode } from "usehooks-ts";

export type ThemeMode = TernaryDarkMode;
export type ResolvedTheme = "light" | "dark";
export type ThemePreset = "devhost" | "shadcn";

export interface IThemeContextValue {
  preset: ThemePreset;
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

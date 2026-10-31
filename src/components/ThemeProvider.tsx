import { LayoutGuard } from "./LayoutGuard.js";
import { useMemo, type ReactElement, type ReactNode } from "react";
import { useIsomorphicLayoutEffect, useTernaryDarkMode } from "usehooks-ts";
import { ThemeContext } from "../theme/ThemeContext.js";
import type { IThemeContextValue, ResolvedTheme, ThemeMode, ThemePreset } from "../theme/types.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import { ScrollGuard } from "./ScrollGuard.js";

export interface IThemeProviderProps {
  children: ReactNode;
  preset?: ThemePreset;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  forcedTheme?: ResolvedTheme;
  controlledTheme?: Pick<IThemeContextValue, "theme" | "setTheme">;
}

function StoredThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "shadcn-alexgorbatchev-theme",
  forcedTheme,
  preset = "devhost",
}: IThemeProviderProps): ReactElement {
  const { isDarkMode, ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode({
    defaultValue: defaultTheme,
    localStorageKey: storageKey,
  });
  return (
    <ThemePalette
      preset={preset}
      theme={forcedTheme ?? ternaryDarkMode}
      resolvedTheme={forcedTheme ?? (isDarkMode ? "dark" : "light")}
      setTheme={setTernaryDarkMode}
    >
      {children}
    </ThemePalette>
  );
}

function ThemePalette({
  children,
  theme,
  resolvedTheme,
  setTheme,
  preset,
}: IThemeContextValue & Pick<IThemeProviderProps, "children">): ReactElement {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreset = preset;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, preset]);

  const value = useMemo<IThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, preset }),
    [theme, resolvedTheme, setTheme, preset],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ScrollGuard />
      <LayoutGuard />
      {children}
    </ThemeContext.Provider>
  );
}

function ControlledThemeProvider({
  children,
  controlledTheme,
  forcedTheme,
  preset = "devhost",
}: IThemeProviderProps & Required<Pick<IThemeProviderProps, "controlledTheme">>): ReactElement {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  const { theme, setTheme } = controlledTheme;
  const resolvedTheme = forcedTheme ?? (theme === "system" ? (isDark ? "dark" : "light") : theme);
  return (
    <ThemePalette theme={forcedTheme ?? theme} resolvedTheme={resolvedTheme} setTheme={setTheme} preset={preset}>
      {children}
    </ThemePalette>
  );
}

export function ThemeProvider(props: IThemeProviderProps): ReactElement {
  if (props.controlledTheme) return <ControlledThemeProvider {...props} controlledTheme={props.controlledTheme} />;
  return <StoredThemeProvider {...props} />;
}

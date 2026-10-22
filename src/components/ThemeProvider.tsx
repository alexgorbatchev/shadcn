import { useMemo, type ReactElement, type ReactNode } from "react";
import { useIsomorphicLayoutEffect, useTernaryDarkMode } from "usehooks-ts";
import { ThemeContext } from "../theme/ThemeContext.js";
import type { IThemeContextValue, ResolvedTheme, ThemeMode } from "../theme/types.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import { ScrollGuard } from "./ScrollGuard.js";

export interface IThemeProviderProps {
  children: ReactNode;
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
}: IThemeProviderProps): ReactElement {
  const { isDarkMode, ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode({
    defaultValue: defaultTheme,
    localStorageKey: storageKey,
  });
  return (
    <ThemePalette
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
}: IThemeContextValue & Pick<IThemeProviderProps, "children">): ReactElement {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<IThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ScrollGuard />
      {children}
    </ThemeContext.Provider>
  );
}

function ControlledThemeProvider({
  children,
  controlledTheme,
  forcedTheme,
}: IThemeProviderProps & Required<Pick<IThemeProviderProps, "controlledTheme">>): ReactElement {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  const { theme, setTheme } = controlledTheme;
  const resolvedTheme = forcedTheme ?? (theme === "system" ? (isDark ? "dark" : "light") : theme);
  return (
    <ThemePalette theme={forcedTheme ?? theme} resolvedTheme={resolvedTheme} setTheme={setTheme}>
      {children}
    </ThemePalette>
  );
}

export function ThemeProvider(props: IThemeProviderProps): ReactElement {
  if (props.controlledTheme) return <ControlledThemeProvider {...props} controlledTheme={props.controlledTheme} />;
  return <StoredThemeProvider {...props} />;
}

import { useMemo, type ReactElement, type ReactNode } from "react";
import { useIsomorphicLayoutEffect, useTernaryDarkMode } from "usehooks-ts";
import { ThemeContext } from "../theme/ThemeContext.js";
import type { IThemeContextValue, ResolvedTheme, ThemeMode } from "../theme/types.js";

export interface IThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  forcedTheme?: ResolvedTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "shadcn-alexgorbatchev-theme",
  forcedTheme,
}: IThemeProviderProps): ReactElement {
  const { isDarkMode, ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode({
    defaultValue: defaultTheme,
    localStorageKey: storageKey,
  });
  const resolvedTheme = forcedTheme ?? (isDarkMode ? "dark" : "light");

  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<IThemeContextValue>(
    () => ({ theme: forcedTheme ?? ternaryDarkMode, resolvedTheme, setTheme: setTernaryDarkMode }),
    [forcedTheme, ternaryDarkMode, resolvedTheme, setTernaryDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

import type { ReactElement } from "react";
import type { ChartStyleProps } from "./types.js";
import type { ResolvedTheme } from "../../theme/types.js";
import cssesc from "cssesc";
const themes: ResolvedTheme[] = ["light", "dark"];
export function ChartStyle({ id, config }: ChartStyleProps): ReactElement | null {
  const colors = Object.entries(config).filter(([, item]) => item.theme ?? item.color);
  if (!colors.length) return null;
  return (
    <style>
      {themes
        .map(
          (theme) =>
            `${theme === "dark" ? "[data-theme=dark] " : ""}[data-chart=${cssesc(id, { isIdentifier: true })}] {\n${colors
              .map(([key, item]) => {
                const color = item.theme?.[theme] ?? item.color;
                return color ? `${cssesc(`--color-${key}`, { isIdentifier: true })}: ${color};` : "";
              })
              .join("\n")}\n}`,
        )
        .join("\n")}
    </style>
  );
}

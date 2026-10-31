import type { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "../src/components/ThemeProvider";
import { DensityProvider } from "../src/components/DensityProvider";
import { TooltipProvider } from "../src/components/Tooltip";
import type { Density } from "../src/density/types";
import type { ThemePreset } from "../src/theme/types";

interface IPreviewFrameProps {
  children: ReactNode;
  theme: "light" | "dark" | "system";
  density: Density;
  preset?: ThemePreset;
}

export function PreviewFrame({ children, theme, density, preset }: IPreviewFrameProps): ReactElement {
  return (
    <ThemeProvider
      preset={preset}
      forcedTheme={theme === "system" ? undefined : theme}
      defaultTheme="system"
      storageKey="shadcn-alexgorbatchev-preview"
    >
      <DensityProvider density={density}>
        <TooltipProvider>
          <div className="mx-auto w-full max-w-xl p-6 text-foreground">{children}</div>
        </TooltipProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}

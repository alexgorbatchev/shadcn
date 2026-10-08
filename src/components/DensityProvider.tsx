import type { ReactNode, ReactElement } from "react";
import { DensityContext } from "../density/DensityContext";
import type { Density } from "../density/types";

export interface IDensityProviderProps {
  children: ReactNode;
  density?: Density;
}

export function DensityProvider({ children, density = "comfortable" }: IDensityProviderProps): ReactElement {
  return (
    <DensityContext.Provider value={density}>
      <div data-density={density} className="font-sans text-base leading-(--ag-leading)">
        {children}
      </div>
    </DensityContext.Provider>
  );
}

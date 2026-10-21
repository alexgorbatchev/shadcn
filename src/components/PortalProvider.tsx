import type { ReactElement, ReactNode } from "react";
import { PortalContext } from "../portal/PortalContext.js";
import type { PortalContainer } from "../portal/types.js";

export interface IPortalProviderProps {
  container: PortalContainer;
  children: ReactNode;
}

export function PortalProvider({ container, children }: IPortalProviderProps): ReactElement {
  return <PortalContext.Provider value={container}>{children}</PortalContext.Provider>;
}

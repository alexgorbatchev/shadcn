import { useContext } from "react";
import { PortalContext } from "../portal/PortalContext.js";
import type { PortalContainer } from "../portal/types.js";

export function usePortalContainer(container?: PortalContainer): PortalContainer {
  const inheritedContainer = useContext(PortalContext);
  return container === undefined ? inheritedContainer : container;
}

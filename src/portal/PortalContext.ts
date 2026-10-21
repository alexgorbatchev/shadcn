import { createContext } from "react";
import type { PortalContainer } from "./types.js";

export const PortalContext = createContext<PortalContainer>(undefined);

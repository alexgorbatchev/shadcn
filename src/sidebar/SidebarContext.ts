import { createContext } from "react";
import type { SidebarContextProps } from "./types.js";

export const SidebarContext = createContext<SidebarContextProps | null>(null);

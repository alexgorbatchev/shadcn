import { useContext } from "react";
import { SidebarContext } from "../sidebar/SidebarContext.js";
import type { SidebarContextProps } from "../sidebar/types.js";

export function useSidebar(): SidebarContextProps {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}
